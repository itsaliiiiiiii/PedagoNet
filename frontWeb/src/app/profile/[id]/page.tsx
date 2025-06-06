"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  User,
  Mail,
  Calendar,
  Briefcase,
  Edit,
  Settings,
  Share2,
  MessageSquare,
  UserPlus,
  Check,
  Clock,
  Bookmark,
  Search,
} from "lucide-react"
import DesktopNav from "@/components/navs/desktopnav"
import MobileNav from "@/components/navs/mobilenav"
import Post from "@/components/feed/post"

// Formatage de la date
const formatDate = (dateObj: any) => {
  const year = dateObj.year.low
  const month = dateObj.month.low
  const day = dateObj.day.low

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]

  return `${day} ${monthNames[month - 1]} ${year}`
}

// Calcul de l'âge
const calculateAge = (dateObj: any) => {
  const birthYear = dateObj.year.low
  const birthMonth = dateObj.month.low
  const birthDay = dateObj.day.low

  const today = new Date()
  let age = today.getFullYear() - birthYear

  // Vérifier si l'anniversaire est déjà passé cette année
  if (today.getMonth() + 1 < birthMonth || (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
    age--
  }

  return age
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params?.id as string

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "friends">("posts")

  useEffect(() => {
    if (!userId) return
    
    setLoading(true)
    setError(null)
    const fetchProfile = async () => {
      try {
        const url = `http://localhost:8080/profile/${userId}`
        const res = await fetch(url, { credentials: "include" })
        let json = null
        try {
          json = await res.json()
        } catch {
          setError("Erreur lors du chargement du profil (réponse invalide)")
          setProfile(null)
          setLoading(false)
          return
        }
        if (!res.ok || !json?.profile) {
          setError(json?.message || "Profil introuvable")
          setProfile(null)
        } else {
          setProfile(json.profile)
        }
      } catch (e: any) {
        setError("Impossible de se connecter au serveur")
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  if (loading) return <div>Chargement...</div>

  // Error display with centered error logo and message
  if (error || !profile)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-6"
        >
          <circle cx="48" cy="48" r="44" fill="#F87171" fillOpacity="0.15" />
          <circle cx="48" cy="48" r="36" fill="#F87171" fillOpacity="0.25" />
          <circle cx="48" cy="48" r="28" fill="#F87171" fillOpacity="0.35" />
          <path
            d="M60 36L36 60M36 36l24 24"
            stroke="#EF4444"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          {error || "Profil introuvable"}
        </div>
        <div className="text-gray-500 dark:text-gray-400">Impossible d'afficher ce profil.</div>
      </div>
    )

  // Données fictives pour les statistiques
  const stats = {
    posts: 42,
    friends: 128,
  }

  // Données fictives pour les publications
  const posts = [
    {
      id: 1,
      content:
        "Je viens de terminer mon projet de fin d'études en intelligence artificielle ! Tellement fière du résultat final. #ComputerScience #AI",
      date: "Il y a 2 jours",
      likes: 24,
      comments: 8,
      image: "https://source.unsplash.com/random/800x600?computer,ai",
    },
    {
      id: 2,
      content:
        "Préparation des examens finaux avec mes camarades de classe. Le café est notre meilleur ami en ce moment ! 📚☕",
      date: "Il y a 1 semaine",
      likes: 35,
      comments: 12,
    },
    {
      id: 3,
      content:
        "J'ai assisté à une conférence fascinante sur l'avenir de l'informatique quantique aujourd'hui. Les possibilités sont infinies !",
      date: "Il y a 2 semaines",
      likes: 18,
      comments: 5,
    },
  ]

  // Données fictives pour les amis
  const friends = [
    { id: 1, name: "Sophie Martin", role: "Étudiante en Informatique" },
    { id: 2, name: "Thomas Dubois", role: "Étudiant en Mathématiques" },
    { id: 3, name: "Emma Petit", role: "Étudiante en Physique" },
    { id: 4, name: "Lucas Moreau", role: "Étudiant en Informatique" },
    { id: 5, name: "Léa Bernard", role: "Étudiante en Chimie" },
    { id: 6, name: "Hugo Leroy", role: "Étudiant en Informatique" },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <DesktopNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        {/* Bannière et photo de profil - Design amélioré */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Photo de couverture fixe avec meilleur design */}
          <div className="h-56 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <div className="px-6 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center">
                {/* Photo de profil avec meilleur positionnement */}
                <div className="relative -mt-20 mb-4 sm:mb-0 sm:mr-5">
                  <div className="h-36 w-36 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 overflow-hidden shadow-md">
                    <img
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                      }}
                    />
                  </div>
                  {profile.isVerified && (
                    <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full shadow-md">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Informations du profil avec meilleur espacement */}
                <div className="pt-2 sm:pt-6">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    {profile.isVerified && (
                      <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Vérifié
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span className="capitalize">{profile.role}</span>
                    {profile.major && (
                      <>
                        <span className="mx-1.5">•</span>
                        <span>{profile.major}</span>
                      </>
                    )}
                  </p>

                  <p className="text-gray-600 dark:text-gray-400 mt-1.5 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Membre depuis {formatDate(profile.createdAt)}</span>
                  </p>
                </div>
              </div>

              {/* Boutons d'action avec meilleur design */}
              <div className="flex mt-5 sm:mt-0 space-x-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center shadow-sm">
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  <span>Message</span>
                </button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center shadow-sm">
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  <span>Suivre</span>
                </button>
                <div className="relative group">
                  <button className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm">
                    <Settings className="h-5 w-5" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10 hidden group-hover:block">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier le profil
                      </div>
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-center">
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager le profil
                      </div>
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-center">
                        <Bookmark className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques avec design amélioré */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2">
            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.posts}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Publications</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.friends}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amis</p>
              </div>
            </div>
          </div>

          {/* Navigation des onglets avec design amélioré */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === "posts"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                Publications
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === "about"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                À propos
              </button>
              <button
                onClick={() => setActiveTab("friends")}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === "friends"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                Amis
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-6">
          {/* Contenu de l'onglet Publications */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Publications récentes</h2>
              </div>

              <div className="space-y-6">
                {posts.map((post) => (
                  <Post
                    key={post.id}
                    postId={post.id.toString()}
                    avatar={<img
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="h-full w-full object-cover rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement

                      } } />}
                    avatarBg="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20"
                    name={`${profile.firstName} ${profile.lastName}`}
                    title={`${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} en ${profile.major}`}
                    time={post.date}
                    content={post.content}
                    image={post.image}
                    imageAlt="Image du post"
                    likes={post.likes}
                    comments={post.comments}
                    isLiked={post.id === 3} authorId={""} 
                    />
                ))}
              </div>
            </div>
          )}

          {/* Contenu de l'onglet À propos - Seulement les informations personnelles */}
          {activeTab === "about" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Informations personnelles</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile.firstName} {profile.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date de naissance</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(profile.dateOfBirth)} ({calculateAge(profile.dateOfBirth)} ans)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Spécialité</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile.major}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenu de l'onglet Amis */}
          {activeTab === "friends" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Amis ({friends.length})</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un ami..."
                    className="pl-8 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img
                        alt={friend.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{friend.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{friend.role}</p>
                    </div>
                    <button className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
