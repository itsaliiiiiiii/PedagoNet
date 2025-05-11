'use client'
import Link from "next/link"
import { User, AlertCircle, Calendar } from "lucide-react"
import Post from "@/components/feed/post"
import DesktopNav from "@/components/navs/desktopnav"
import MobileNav from "@/components/navs/mobilenav"
import CreatePost from "@/components/feed/create-post"
import { useEffect, useState, useRef, useCallback, JSX } from "react"

export default function HomePage() {
  interface Profile {
    id_user: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: string;
    major?: string;
  }

  interface PostData {
    id: string;
    avatar: JSX.Element;
    avatarBg: string;
    name: string;
    title: string;
    time: string;
    content: string;
    likes: number;
    comments: number;
    image?: string;
    imageAlt?: string;
    isLiked?: boolean;
  }

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Format time ago
  const formatTimeAgo = (timestamp: any): string => {
    if (!timestamp) return "N/A";

    const postDate = new Date(
      timestamp.year.low || timestamp.year,
      (timestamp.month.low || timestamp.month) - 1,
      timestamp.day.low || timestamp.day,
      timestamp.hour.low || timestamp.hour,
      timestamp.minute.low || timestamp.minute,
      timestamp.second.low || timestamp.second
    );

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8080/profile/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        if (data.success) {
          setProfile(data.profile);
        } else {
          setError(data.message || 'Profile not found');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch posts from API
  const fetchPosts = useCallback(async (pageNumber: number) => {
    setIsLoadingPosts(true);
    setPostsError(null);
    try {
      const limit = 4;
      const skip = (pageNumber - 1) * limit;

      const response = await fetch(`http://localhost:8080/posts?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch posts');
      }

      // Transform API posts to match PostData interface
      const newPosts = data.posts.map((apiPost: any) => {
        const isProfessor = apiPost.author.role === "professor";
        const isStudent = apiPost.author.role === "student";

        return {
          id: apiPost.id_post,
          avatar: <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
          avatarBg: isProfessor
            ? "bg-purple-100 dark:bg-purple-900/30"
            : isStudent
              ? "bg-blue-100 dark:bg-blue-900/30"
              : "bg-gray-100 dark:bg-gray-700",
          name: `${apiPost.author.lastName} ${apiPost.author.firstName}`,
          title: isProfessor
            ? `Professeur de ${apiPost.author.department || "non spécifié"}`
            : isStudent
              ? `Étudiant en ${apiPost.author.major || "non spécifié"}`
              : "Membre",
          time: formatTimeAgo(apiPost.createdAt),
          content: apiPost.content,
          likes: apiPost.likes || 0,
          comments: apiPost.comments || 0,
          image: apiPost.imageUrl || undefined,
          imageAlt: apiPost.imageAlt || undefined,
          isLiked: apiPost.isLiked || false
        };
      });

      if (pageNumber === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
      }

      // Determine if there are more posts to load
      setHasMore(newPosts.length === limit);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setPostsError(err.message);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  // Initial posts load
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Infinite scroll observer
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingPosts || !hasMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingPosts) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoadingPosts, hasMore]);

  // Load more posts when page changes
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      <DesktopNav />
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left Sidebar - Profile */}
          <aside className="hidden lg:block lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden top-20">
              {/* Profile Background */}
              <div className="h-14 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700"></div>
              {/* Profile Info */}
              <div className="px-4 pt-4 pb-2 text-center border-b border-gray-200 dark:border-gray-700">
                <div className="h-16 w-16 mx-auto -mt-12 rounded-full border-2 border-white dark:border-gray-800 bg-blue-100 dark:bg-gray-700 flex items-center justify-center shadow-sm">
                  <User className="h-8 w-8 text-blue-600 dark:text-gray-300" />
                </div>
                {loading ? (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading profile...</div>
                ) : error ? (
                  <>
                  
                  <div className="rounded-md bg-red-50 p-3 mt-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <p>{error}</p>
                    </div>
                  </div>
                  </>
                ) : (
                  <>
                    <Link href="/profile" className="mt-2 text-lg font-medium text-gray-600 dark:text-white hover:text-gray-800 ">
                      {profile?.lastName} {profile?.firstName}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {profile?.role || "n/a"} •{" "}
                      {profile?.role === "srofessor"
                        ? profile?.department || "Department not specified"
                        : profile?.role === "student"
                          ? profile?.major || "Major not specified"
                          : "n/a"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </aside>
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            <CreatePost />
            {postsError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p>{postsError}</p>
                </div>
              </div>
            )}

            {posts.map((post, index) => (
              <div
                key={index}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
              >
                <Post
                  avatar={post.avatar}
                  avatarBg={post.avatarBg}
                  name={post.name}
                  title={post.title}
                  time={post.time}
                  content={post.content}
                  likes={post.likes}
                  comments={post.comments}
                  image={post.image}
                  imageAlt={post.imageAlt}
                  isLiked={post.isLiked}
                />
              </div>
            ))}

            {isLoadingPosts && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {!hasMore && !isLoadingPosts && posts.length > 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                Vous avez atteint la fin des publications
              </div>
            )}

            {!isLoadingPosts && posts.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Aucune publication à afficher
              </div>
            )}
          </div>

          <aside className="hidden lg:block lg:col-span-1">
            {/* Who to Connect */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Personnes à suivre</h3>
              </div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Sophie Dubois</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Élève - Terminale S</p>
                    <button className="mt-2 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                      + Suivre
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Lucas Moreau</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Club Informatique</p>
                    <button className="mt-2 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                      + Suivre
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <Link href="/network" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Voir toutes les suggestions
                </Link>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Événements à venir</h3>
              </div>
              <div className="p-3">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-sm">
                      15
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Répétition Théâtre</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Demain, 16h00</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                      18
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Devoir de Mathématiques</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Vendredi, 10h00</p>
                    </div>
                  </div>
                </div>
                <Link href="/events" className="block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Voir plus d'événements
                </Link>
              </div>
            </div>

            {/* Groups */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Vos groupes</h3>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  <Link
                    href="/groups/entraide"
                    className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <span className="w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full"></span>
                    <span>Entraide Terminale S</span>
                  </Link>
                  <Link
                    href="/groups/science"
                    className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <span className="w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full"></span>
                    <span>Club Sciences</span>
                  </Link>
                  <Link
                    href="/groups/theatre"
                    className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <span className="w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full"></span>
                    <span>Club Théâtre</span>
                  </Link>
                </div>
                <Link href="/groups" className="block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Voir tous les groupes
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}