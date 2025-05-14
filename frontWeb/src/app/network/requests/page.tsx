"use client"

import { useState, useEffect } from "react"
import { User, AlertCircle, Check, X, Filter, Search, Users } from 'lucide-react'
import DesktopNav from "@/components/navs/desktopnav"
import MobileNav from "@/components/navs/mobilenav"
import Link from "next/link"

export default function ConnectionRequestsPage() {
  // Types
  interface ConnectionRequest {
    id: number
    id_user: string
    firstName: string
    lastName: string
    avatar: string
    requestDate: string
    role: string
    status?: "online" | "offline" | "away"
    department?: string
    major?: string
  }

  // État
  const [activeRequest, setActiveRequest] = useState<ConnectionRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([])

  // Fonction pour déterminer si une demande est nouvelle (moins de 24 heures)
  const isNewRequest = (requestDate: string) => {
    const requestDateObj = new Date(requestDate)
    const now = new Date()
    const diffInHours = (now.getTime() - requestDateObj.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 24
  }

  // Données de démonstration
  useEffect(() => {
    // Simuler un chargement d'API
    const timer = setTimeout(() => {
      setPendingRequests([
        {
          id: 1,
          id_user: "user1",
          firstName: "Marie",
          lastName: "Dubois",
          avatar: "/placeholder.svg?height=40&width=40",
          requestDate: "2025-05-12T05:53:19",
          role: "Etudiant",
          status: "online",
          major: "Informatique",
        },
        {
          id: 2,
          id_user: "user2",
          firstName: "Thomas",
          lastName: "Laurent",
          avatar: "/placeholder.svg?height=40&width=40",
          requestDate: "2025-05-11T07:53:19",
          role: "Etudiant",
          status: "offline",
          major: "Physique",
        },
        {
          id: 3,
          id_user: "user3",
          firstName: "Jean",
          lastName: "Martin",
          avatar: "/placeholder.svg?height=40&width=40",
          requestDate: "2025-05-09T16:53:19",
          role: "prof",
          status: "away",
          department: "Mathématiques",
        },
        {
          id: 4,
          id_user: "user4",
          firstName: "Sophie",
          lastName: "Moreau",
          avatar: "/placeholder.svg?height=40&width=40",
          requestDate: "2025-05-08T16:53:19",
          role: "Etudiant",
          status: "online",
          major: "Chimie",
        },
        {
          id: 5,
          id_user: "user5",
          firstName: "Lucas",
          lastName: "Bernard",
          avatar: "/placeholder.svg?height=40&width=40",
          requestDate: "2025-05-05T16:53:19",
          role: "Etudiant",
          major: "Économie",
        },
        {
          id: 6,
          id_user: "user6",
          firstName: "Emma",
          lastName: "Petit",
          avatar: "/placeholder.svg?height=40&width=40",
          requestDate: "2025-05-05T10:53:19",
          role: "Etudiant",
          status: "offline",
          major: "Biologie",
        },
        {
          id: 7,
          id_user: "user7",
          firstName: "Alexandre",
          lastName: "Dupont",
          avatar: "/placeholder.svg?height=40&width=40",
          requestDate: "2025-04-28T16:53:19",
          role: "prof",
          department: "Informatique",
        },
      ])
      setActiveRequest(null)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filtrer les demandes
  const filteredRequests = pendingRequests.filter((request) => {
    return (
      searchQuery === "" ||
      `${request.firstName} ${request.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.major && request.major.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.department && request.department.toLowerCase().includes(searchQuery.toLowerCase()))
  )})

  // Gérer les actions sur les demandes
  const handleAcceptRequest = (requestId: number) => {
    console.log("Acceptation de la demande:", requestId)
    setPendingRequests(pendingRequests.filter((req) => req.id !== requestId))
    if (activeRequest?.id === requestId) {
      setActiveRequest(null)
    }
  }

  const handleRejectRequest = (requestId: number) => {
    console.log("Refus de la demande:", requestId)
    setPendingRequests(pendingRequests.filter((req) => req.id !== requestId))
    if (activeRequest?.id === requestId) {
      setActiveRequest(null)
    }
  }

  // Format date for display
  const formatRequestDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Aujourd'hui"
    if (diffInDays === 1) return "Hier"
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays/7)} semaines`
    return `Il y a ${Math.floor(diffInDays/30)} mois`
  }

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      <DesktopNav />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left Sidebar - Network Navigation */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Réseau</h3>
              </div>
              <div className="p-2">
                <nav className="space-y-1">
                  <Link
                    href="/network"
                    className="flex items-center gap-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  >
                    <Users className="h-4 w-4" />
                    <span>Mes connexions</span>
                  </Link>
                  <Link
                    href="/network/requests"
                    className="flex items-center gap-2 p-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium rounded-md"
                  >
                    <User className="h-4 w-4" />
                    <span>Demandes de connexion</span>
                    {pendingRequests.length > 0 && (
                      <span className="ml-auto bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {pendingRequests.length}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/network/suggestions"
                    className="flex items-center gap-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  >
                    <User className="h-4 w-4" />
                    <span>Suggestions</span>
                  </Link>
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content - Connection Requests */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Demandes de connexion</h1>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Filter className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="mt-3 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une demande..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Spacer */}
                <div className="mt-4 border-b border-gray-200 dark:border-gray-700"></div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-4">
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredRequests.length === 0 && (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    Aucune demande de connexion
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Vous n'avez pas de demandes de connexion en attente pour le moment.
                  </p>
                </div>
              )}

              {/* Connection Requests List */}
              {!loading && !error && filteredRequests.length > 0 && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRequests.map((request) => (
                    <ConnectionRequestItem
                      key={request.id}
                      request={request}
                      isActive={activeRequest?.id === request.id}
                      onClick={() => setActiveRequest(request.id === activeRequest?.id ? null : request)}
                      onAccept={() => handleAcceptRequest(request.id)}
                      onReject={() => handleRejectRequest(request.id)}
                      isNew={isNewRequest(request.requestDate)}
                      formattedDate={formatRequestDate(request.requestDate)}
                    />
                  ))}
                </div>
              )}

              {/* Selected Request Details */}
              {activeRequest && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      {/* Profile Image */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={activeRequest.avatar || "/placeholder.svg"}
                          alt={`${activeRequest.firstName} ${activeRequest.lastName}`}
                          className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-sm"
                        />
                        {activeRequest.status === "online" && (
                          <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                        )}
                        {activeRequest.status === "away" && (
                          <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-yellow-500 border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {activeRequest.firstName} {activeRequest.lastName}
                        </h2>

                        {/* Role Badge */}
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activeRequest.role === "prof"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                          >
                            {activeRequest.role === "prof" ? "Professeur" : "Étudiant"}
                          </span>
                        </div>

                        {/* Date de la demande */}
                        <div className="mt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Demande reçue {formatRequestDate(activeRequest.requestDate)}
                          </span>
                        </div>

                        {/* Informations utilisateur */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeRequest.role === "prof" && activeRequest.department && (
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Département</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {activeRequest.department}
                              </p>
                            </div>
                          )}

                          {activeRequest.role === "Etudiant" && activeRequest.major && (
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Spécialité</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {activeRequest.major}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                      <button
                        onClick={() => handleAcceptRequest(activeRequest.id)}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleRejectRequest(activeRequest.id)}
                        className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

// Composant pour l'élément de demande de connexion
function ConnectionRequestItem({
  request,
  isActive,
  onClick,
  onAccept,
  onReject,
  isNew,
  formattedDate,
}: {
  request: {
    id: number
    id_user: string
    firstName: string
    lastName: string
    avatar: string
    requestDate: string
    role: string
    status?: "online" | "offline" | "away"
    department?: string
    major?: string
  }
  isActive: boolean
  onClick: () => void
  onAccept: () => void
  onReject: () => void
  isNew: boolean
  formattedDate: string
}) {
  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50  ${
        isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar avec statut */}
        <div className="relative ">
          <img
            src={request.avatar || "/placeholder.svg"}
            alt={`${request.firstName} ${request.lastName}`}
            className="h-12 w-12 rounded-full object-cover"
          />
          {request.status === "online" && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
          )}
          {request.status === "away" && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-yellow-500 border-2 border-white dark:border-gray-800"></div>
          )}
        </div>

        {/* Informations sur la demande */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate select-none cursor-pointer" onClick={onClick}>
              {request.firstName} {request.lastName}
            </h3>
            <span className="text-xs ml-2 text-gray-500 dark:text-gray-400 select-none">{formattedDate}</span>
          </div>

          {/* Rôle et informations spécifiques */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-1.5 py-0.5 text-xs rounded-full select-none ${
                request.role === "prof"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              {request.role === "prof" ? "Professeur" : "Étudiant"}
            </span>

            {request.role === "prof" && request.department && (
              <span className="text-xs select-none text-gray-600 dark:text-gray-400">
                {request.department}
              </span>
            )}

            {request.role === "Etudiant" && request.major && (
              <span className="text-xs select-none text-gray-600 dark:text-gray-400">
                {request.major}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAccept()
          }}
          className="px-3 py-1 rounded-md bg-blue-600 dark:bg-blue-500 text-white text-xs font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Accepter
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onReject()
          }}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
        >
          Refuser
        </button>
      </div>

      {/* Indicateurs */}
      <div className="flex justify-end items-center mt-1">
        {isNew && (
          <div className="bg-blue-600 dark:bg-blue-500 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-2 mt-1">
            Nouveau
          </div>
        )}
      </div>
    </div>
  )
}