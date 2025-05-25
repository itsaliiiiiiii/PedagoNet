"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { User, AlertCircle } from "lucide-react"
import Post from "@/components/feed/post"
import DesktopNav from "@/components/navs/desktopnav"
import MobileNav from "@/components/navs/mobilenav"
import CreatePost from "@/components/feed/create-post"

// Type pour les attachements
interface Attachment {
  filename: string
  originalName: string
  mimetype: string
  size: number
}

// Type pour les données de post
interface PostData {
  id: string
  author: {
    id: string
    name: string
    avatar: string
    title: string
    role?: string
  }
  content: string
  createdAt: string
  attachments: string // Chaîne JSON d'attachements
  likes: number
  comments: number
  isLiked: boolean
  visibility: "public" | "friends" | "private"
}

// Type pour le profil utilisateur
interface Profile {
  id_user: string
  firstName: string
  lastName: string
  role: string
  department?: string
  major?: string
}

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [posts, setPosts] = useState<PostData[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [postsError, setPostsError] = useState<string | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)
  const processAttachments = (attachmentsJson: string | string[]) => {
    try {
      let attachments: Attachment[] = [];
      
      // Case 1: Input is an array of stringified objects
      if (Array.isArray(attachmentsJson)) {
        attachments = attachmentsJson.map(item => {
          try {
            return typeof item === 'string' ? JSON.parse(item) : item;
          } catch (e) {
            console.error("Error parsing stringified attachment:", item);
            return null;
          }
        }).filter(Boolean) as Attachment[];
      } 
      // Case 2: Input is a single stringified array
      else if (typeof attachmentsJson === 'string') {
        try {
          attachments = JSON.parse(attachmentsJson);
        } catch (e) {
          console.error("Error parsing attachments string:", attachmentsJson);
          return null;
        }
      }

      if (!attachments || attachments.length === 0) {
        return null;
      }

      const firstAttachment = attachments[0];
      const baseUrl = "http://localhost:8080/upload/";

      if (attachments.every((att) => att?.mimetype?.startsWith("image/"))) {
        return {
          type: "images",
          data: attachments.map((att) => `${baseUrl}${att.filename}`),
        };
      }
      else if (firstAttachment.mimetype.startsWith("video/")) {
        return {
          type: "video",
          data: {
            url: `${baseUrl}${firstAttachment.filename}`,
            thumbnail: "/placeholder.svg?height=400&width=600&text=Miniature+Vidéo",
          },
        };
      }
      else {
        return {
          type: "document",
          data: {
            url: `${baseUrl}${firstAttachment.filename}`,
            name: firstAttachment.originalName,
            type: firstAttachment.mimetype,
            size: firstAttachment.size,
          },
        };
      }
    } catch (err) {
      console.error("Error processing attachments:", err);
      return null;
    }
  };

  const formatTimeAgo = (timestamp: any): string => {
    // Gérer différents formats de date

    if (!timestamp) return "N/A"
    let postDate: Date

    if (typeof timestamp === "string") {
      postDate = new Date(timestamp)
    } else {
      postDate = new Date(
        timestamp.year?.low || timestamp.year,
        (timestamp.month?.low || timestamp.month) - 1,
        timestamp.day?.low || timestamp.day,
        timestamp.hour?.low || timestamp.hour,
        timestamp.minute?.low || timestamp.minute,
        timestamp.second?.low || timestamp.second,
      )
    }

    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

    if (diffInSeconds < 60) return "À l'instant"
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`

    return postDate.toLocaleDateString()
  }

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8080/profile/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        if (data.success) {
          setProfile(data.profile)
        } else {
          setError(data.message || "Profile not found")
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Fetch posts from API
  const fetchPosts = useCallback(async (pageNumber: number) => {
    setIsLoadingPosts(true)
    setPostsError(null)
    try {
      const limit = 4
      const skip = (pageNumber - 1) * limit

      const response = await fetch(`http://localhost:8080/posts?limit=${limit}&skip=${skip}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch posts")
      }

      // Transform API posts to match PostData interface
      const newPosts = data.posts.map((apiPost: any) => {
        console.log("API Post:", apiPost)
        return {
          id: apiPost.id,
          author: {
            id: apiPost.author.id || "unknown",
            name: `${apiPost.author.lastName} ${apiPost.author.firstName}`,
            avatar: "",
            title:
              apiPost.author.role === "professor"
                ? `Professeur de ${apiPost.author.department || "non spécifié"}`
                : apiPost.author.role === "student"
                  ? `Étudiant en ${apiPost.author.major || "non spécifié"}`
                  : "Membre",
            role: apiPost.author.role,
          },
          content: apiPost.content,
          createdAt: apiPost.createdAt,
          attachments: apiPost.attachments || "[]",
          likes: apiPost.likesCount || 0,
          comments: apiPost.comments || 0,
          isLiked: apiPost.hasLiked || false,
          visibility: apiPost.visibility || "public",
        }
      })

      if (pageNumber === 1) {
        setPosts(newPosts)
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts])
      }
      setHasMore(newPosts.length === limit)
    } catch (err: any) {
      console.error("Error fetching posts:", err)
      setPostsError(err.message)
    } finally {
      setIsLoadingPosts(false)
    }
  }, [])

  // Initial posts load
  useEffect(() => {
    fetchPosts(1)
  }, [fetchPosts])

  // Infinite scroll observer
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingPosts || !hasMore) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingPosts) {
          setPage((prevPage) => prevPage + 1)
        }
      })

      if (node) observer.current.observe(node)
    },
    [isLoadingPosts, hasMore],
  )

  // Load more posts when page changes
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page)
    }
  }, [page, fetchPosts])

  // Générer une couleur de fond d'avatar basée sur l'ID de l'auteur
  const getAvatarBg = (authorId: string, role?: string) => {
    const avatarColors = [
      "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20",
      "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/20",
      "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/20",
      "bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-800/20",
      "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/20",
    ]

    // Si le rôle est spécifié, utiliser une couleur spécifique
    if (role === "professor") {
      return "bg-purple-100 dark:bg-purple-900/30"
    } else if (role === "student") {
      return "bg-blue-100 dark:bg-blue-900/30"
    }

    // Sinon, utiliser l'ID pour choisir une couleur
    const index = Math.abs(authorId.charCodeAt(0)) % avatarColors.length
    return avatarColors[index]
  }

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
                  <div className="rounded-md bg-red-50 p-3 mt-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <p>{error}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/profile"
                      className="mt-2 text-lg font-medium text-gray-600 dark:text-white hover:text-gray-800 "
                    >
                      {profile?.lastName} {profile?.firstName}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {profile?.role || "n/a"} •{" "}
                      {profile?.role === "professor"
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

            {posts.map((post, index) => {
              const media = processAttachments(post.attachments)
              const avatarBg = getAvatarBg(post.author.id, post.author.role)
              return (
                <div key={index} ref={index === posts.length - 1 ? lastPostElementRef : null}>
                  <Post
                    key={post.id}
                    postId={post.id}
                    avatar={post.author.avatar || <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                    avatarBg={avatarBg}
                    name={post.author.name}
                    title={post.author.title || "Utilisateur"}
                    time={formatTimeAgo(post.createdAt)}
                    content={post.content}
                    {...(media?.type === "images" ? { images: media.data } : {})}
                    {...(media?.type === "video" ? { video: media.data } : {})}
                    {...(media?.type === "document" ? { document: media.data } : {})}
                    likes={post.likes}
                    comments={post.comments}
                    isLiked={post.isLiked}
                    visibility={post.visibility}
                  />
                </div>
              )
            })}

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
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Aucune publication à afficher</div>
            )}
          </div>

          {/* Right Sidebar */}
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
