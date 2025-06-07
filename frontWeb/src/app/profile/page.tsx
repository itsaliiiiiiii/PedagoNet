"use client"

import type React from "react"
import Image from "next/image"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  User,
  Mail,
  Calendar,
  Briefcase,
  MessageSquare,
  Check,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  ImageIcon,
  AlertCircle,
} from "lucide-react"
import DesktopNav from "@/components/navs/desktopnav"
import MobileNav from "@/components/navs/mobilenav"
import Post from "@/components/feed/post"

// Type pour les attachements (Copied from home-page.tsx)
interface Attachment {
  filename: string
  originalName: string
  mimetype: string
  size: number
}

// Type pour les données de post (Copied from home-page.tsx)
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

// Process attachments function (Copied from home-page.tsx)
const processAttachments = (attachmentsJson: string | string[]) => {
  try {
    let attachments: Attachment[] = []

    // Case 1: Input is an array of stringified objects
    if (Array.isArray(attachmentsJson)) {
      attachments = attachmentsJson
        .map((item) => {
          try {
            return typeof item === "string" ? JSON.parse(item) : item
          } catch (e) {
            console.error("Error parsing stringified attachment:", item)
            return null
          }
        })
        .filter(Boolean) as Attachment[]
    }
    // Case 2: Input is a single stringified array
    else if (typeof attachmentsJson === "string") {
      try {
        attachments = JSON.parse(attachmentsJson)
      } catch (e) {
        console.error("Error parsing attachments string:", attachmentsJson)
        return null
      }
    }

    if (!attachments || attachments.length === 0) {
      return null
    }

    const firstAttachment = attachments[0]
    const baseUrl = "http://localhost:8080/upload/"

    if (attachments.every((att) => att?.mimetype?.startsWith("image/"))) {
      return {
        type: "images",
        data: attachments.map((att) => `${baseUrl}${att.filename}`),
      }
    } else if (firstAttachment.mimetype.startsWith("video/")) {
      return {
        type: "video",
        data: {
          url: `${baseUrl}${firstAttachment.filename}`,
          thumbnail: "/placeholder.svg?height=400&width=600&text=Miniature+Vidéo",
        },
      }
    } else {
      return {
        type: "document",
        data: {
          url: `${baseUrl}${firstAttachment.filename}`,
          name: firstAttachment.originalName,
          type: firstAttachment.mimetype,
          size: firstAttachment.size,
        },
      }
    }
  } catch (err) {
    console.error("Error processing attachments:", err)
    return null
  }
}

// Format time ago function (Copied from home-page.tsx)
const formatTimeAgo = (timestamp: any): string => {
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

// Generate avatar background color (Copied from home-page.tsx)
const getAvatarBg = (authorId: string, role?: string) => {
  const avatarColors = [
    "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20",
    "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/20",
    "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/20",
    "bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-800/20",
    "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/20",
  ]

  if (role === "professor") {
    return "bg-purple-100 dark:bg-purple-900/30"
  } else if (role === "student") {
    return "bg-blue-100 dark:bg-blue-900/30"
  }

  const index = Math.abs(authorId.charCodeAt(0)) % avatarColors.length
  return avatarColors[index]
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "friends">("posts")
  const [isEditingPhoto, setIsEditingPhoto] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    type: "success" | "error"
  } | null>(null)

  // New states for posts (Copied from home-page.tsx)
  const [userPosts, setUserPosts] = useState<PostData[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [postsError, setPostsError] = useState<string | null>(null)

  const observer = useRef<IntersectionObserver | null>(null) // For infinite scroll

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type })
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    const fetchProfile = async () => {
      try {
        const url = `http://localhost:8080/profile/me`
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
  }, [])

  // Fetch user-specific posts (Adapted from home-page.tsx's fetchPosts)
  const fetchUserPosts = useCallback(
    async (pageNumber: number) => {
      if (!profile?.id_user) return // Ensure profile ID is available
      setIsLoadingPosts(true)
      setPostsError(null)
      try {
        const limit = 4
        const skip = (pageNumber - 1) * limit

        const response = await fetch(
          `http://localhost:8080/posts/user/${profile.id_user}?limit=${limit}&skip=${skip}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        )

        if (!response.ok) {
          throw new Error("Failed to fetch posts")
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch posts")
        }

        const newPosts = data.posts.map((apiPost: any) => {
          return {
            id: apiPost.id,
            author: {
              id: apiPost.author.id || "unknown",
              name: `${apiPost.author.lastName} ${apiPost.author.firstName}`,
              avatar: apiPost.author.profilePhoto ? `http://localhost:8080/upload/${apiPost.author.profilePhoto}` : "", // Use actual avatar if available
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
          setUserPosts(newPosts)
        } else {
          setUserPosts((prevPosts) => [...prevPosts, ...newPosts])
        }
        setHasMore(newPosts.length === limit)
      } catch (err: any) {
        console.error("Error fetching user posts:", err)
        setPostsError(err.message)
      } finally {
        setIsLoadingPosts(false)
      }
    },
    [profile],
  ) // Dependency on profile to ensure id_user is available

  // Initial posts load when profile is ready
  useEffect(() => {
    if (profile?.id_user) {
      fetchUserPosts(1)
    }
  }, [profile, fetchUserPosts])

  // Infinite scroll observer (Copied from home-page.tsx)
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

  // Load more posts when page changes (Copied from home-page.tsx)
  useEffect(() => {
    if (page > 1) {
      fetchUserPosts(page)
    }
  }, [page, fetchUserPosts])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      showToast("Veuillez sélectionner une image à télécharger.", "error")
      return
    }

    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append("profilePhoto", selectedFile)

    try {
      const response = await fetch("http://localhost:8080/profile/photo", {
        method: "PUT",
        body: formData,
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setProfile((prevProfile: any) => ({
          ...prevProfile,
          profilePhoto: data.profilePhotoPath, // Assuming the backend returns the new photo path
        }))
        showToast("Photo de profil mise à jour avec succès !", "success")
        setIsEditingPhoto(false)
        setSelectedFile(null)
      } else {
        throw new Error(data.message || "Échec de la mise à jour de la photo de profil.")
      }
    } catch (err: any) {
      console.error("Error uploading photo:", err)
      showToast(err.message || "Une erreur est survenue lors du téléchargement de la photo.", "error")
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading) return <div>Chargement...</div>

  if (error || !profile)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
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
        <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mb-2 font-sans tracking-tight text-center">
          Oups, ce profil est introuvable !
        </div>
        <div className="text-base font-medium text-gray-600 dark:text-gray-300 text-center max-w-md mb-2">
          Il semble que ce profil n'existe pas ou n'est plus disponible.
          <br />
          Vérifiez le lien ou essayez de revenir plus tard.
        </div>
        <div className="text-sm text-gray-400 dark:text-gray-500 italic mt-2">
          {error && <span>Détail : {error}</span>}
        </div>
      </div>
    )

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
                    <Image
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="h-full w-full object-cover"
                      src={
                        profile.profilePhoto
                          ? `http://localhost:8080/upload/${profile.profilePhotoFilename}`
                          : "/placeholder.svg"
                      }
                      width={144} // Corresponds to h-36 w-36 (144px)
                      height={144}
                      priority // This image is likely above the fold
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
                <button
                  onClick={() => setIsEditingPhoto(true)}
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm"
                  title="Modifier la photo de profil"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Photo Edit Input Section */}
            {isEditingPhoto && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner flex flex-col sm:flex-row items-center gap-4">
                <label htmlFor="profile-photo-upload" className="flex-shrink-0 cursor-pointer">
                  <div className="h-24 w-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
                    {selectedFile ? (
                      <Image
                        src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                        alt="Aperçu"
                        className="h-full w-full object-cover rounded-full"
                        width={96} // Corresponds to h-24 w-24 (96px)
                        height={96}
                        unoptimized // Temporary client-side blob, no optimization needed
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8" />
                    )}
                  </div>
                  <input
                    id="profile-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedFile ? selectedFile.name : "Sélectionnez une nouvelle photo de profil"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Fichier JPG, PNG ou GIF. Taille maximale 5MB.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
                  <button
                    onClick={handlePhotoUpload}
                    disabled={!selectedFile || uploadingPhoto}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {uploadingPhoto ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {uploadingPhoto ? "Téléchargement..." : "Enregistrer la photo"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPhoto(false)
                      setSelectedFile(null)
                    }}
                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Statistiques avec design amélioré */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2">
            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.postCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Publications</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.connectionCount}</p>
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
                {postsError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <p>{postsError}</p>
                    </div>
                  </div>
                )}

                {userPosts.map((post, index) => {
                  const media = processAttachments(post.attachments)
                  const avatarBg = getAvatarBg(post.author.id, post.author.role)
                  return (
                    <div key={index} ref={index === userPosts.length - 1 ? lastPostElementRef : null}>
                      <Post
                        authorId={post.author.id}
                        key={post.id}
                        postId={post.id}
                        avatar={
                          post.author.avatar ? (
                            <Image
                              src={post.author.avatar || "/placeholder.svg"}
                              alt={`${post.author.name}'s avatar`}
                              className="h-full w-full object-cover rounded-full"
                              width={48}
                              height={48}
                            />
                          ) : (
                            <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          )
                        }
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

                {!hasMore && !isLoadingPosts && userPosts.length > 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Vous avez atteint la fin des publications
                  </div>
                )}

                {!isLoadingPosts && userPosts.length === 0 && !postsError && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">Aucune publication à afficher</div>
                )}
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
                      <Image
                        alt={friend.name}
                        className="h-full w-full object-cover"
                        src="/placeholder.svg" // Using a generic placeholder for friends
                        width={48} // Corresponds to h-12 w-12 (48px) container
                        height={48}
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

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <MobileNav />
    </div>
  )
}
