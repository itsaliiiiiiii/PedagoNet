"use client"

import { useState, useEffect } from "react"
import { User, AlertCircle, Check, X, Filter, Search, Users, CheckCircle, XCircle } from "lucide-react"
import DesktopNav from "@/components/navs/desktopnav"
import MobileNav from "@/components/navs/mobilenav"
import Link from "next/link"

export default function ConnectionRequestsPage() {
  // Types
  interface ConnectionRequest {
    userId: string
    email: string
    firstName: string
    lastName: string
    profilePhoto: string
    role: string
    department: string | null
    class: string | null
    status: string
    sentAt: string
  }

  
  const [activeRequest, setActiveRequest] = useState<ConnectionRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([])
  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    type: "success" | "error"
  } | null>(null)

  
  const isNewRequest = (sentAt: string) => {
    const requestDateObj = new Date(sentAt)
    const now = new Date()
    const diffInHours = (now.getTime() - requestDateObj.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 24
  }

  
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type })
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  useEffect(() => {
    // Function to fetch pending connection requests
    const fetchPendingRequests = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("http://localhost:8080/connections/pending", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        })

        if (!response.ok) {
          throw new Error("Failed to fetch pending requests")
        }

        const data = await response.json()

        if (data.success) {
          setPendingRequests(data.pendingConnections)
        } else {
          throw new Error(data.message || "Failed to fetch pending requests")
        }
      } catch (err) {
        console.error("Error fetching pending requests:", err)
        setError("Une erreur est survenue lors du chargement des demandes de connexion.")
      } finally {
        setLoading(false)
      }
    }

    fetchPendingRequests()
  }, [])

  // Filtrer les demandes
  const filteredRequests = pendingRequests.filter((request) => {
    return (
      searchQuery === "" ||
      `${request.firstName} ${request.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.class && request.class.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.department && request.department.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  // Gérer les actions sur les demandes
  const handleAcceptRequest = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/connections/accept/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        // Remove the request from the list on success
        setPendingRequests(pendingRequests.filter((req) => req.userId !== userId))
        if (activeRequest?.userId === userId) {
          setActiveRequest(null)
        }
        // Afficher le toast de succès
        showToast("Demande de connexion acceptée avec succès", "success")
      } else {
        setError("Impossible d'accepter la demande. Veuillez réessayer.")
        showToast("Impossible d'accepter la demande", "error")
      }
    } catch (error) {
      console.error("Error accepting request:", error)
      setError("Une erreur est survenue lors de l'acceptation de la demande.")
      showToast("Une erreur est survenue lors de l'acceptation de la demande", "error")
    }
  }

  const handleRejectRequest = async (userId: string) => {
    try {
      // Call your API to reject the request
      const response = await fetch(`http://localhost:8080/connections/refuse/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        // Remove the request from the list on success
        setPendingRequests(pendingRequests.filter((req) => req.userId !== userId))
        if (activeRequest?.userId === userId) {
          setActiveRequest(null)
        }
        // Afficher le toast de succès
        showToast("Demande de connexion refusée", "success")
      } else {
        setError("Impossible de refuser la demande. Veuillez réessayer.")
        showToast("Impossible de refuser la demande", "error")
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      setError("Une erreur est survenue lors du refus de la demande.")
      showToast("Une erreur est survenue lors du refus de la demande", "error")
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
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
    return `Il y a ${Math.floor(diffInDays / 30)} mois`
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
                      key={request.userId}
                      request={request}
                      isActive={activeRequest?.userId === request.userId}
                      onClick={() => setActiveRequest(request.userId === activeRequest?.userId ? null : request)}
                      onAccept={() => handleAcceptRequest(request.userId)}
                      onReject={() => handleRejectRequest(request.userId)}
                      isNew={isNewRequest(request.sentAt)}
                      formattedDate={formatRequestDate(request.sentAt)}
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
                          src={
                            activeRequest.profilePhoto ? `/uploads/${activeRequest.profilePhoto}` : "/placeholder.svg"
                          }
                          alt={`${activeRequest.firstName} ${activeRequest.lastName}`}
                          className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-sm"
                        />
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
                              activeRequest.role === "professor"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                          >
                            {activeRequest.role === "professor" ? "Professeur" : "Étudiant"}
                          </span>
                        </div>

                        {/* Date de la demande */}
                        <div className="mt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Demande reçue {formatRequestDate(activeRequest.sentAt)}
                          </span>
                        </div>

                        {/* Informations utilisateur */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeRequest.role === "professor" && activeRequest.department && (
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Département</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {activeRequest.department}
                              </p>
                            </div>
                          )}

                          {activeRequest.role === "student" && activeRequest.class && (
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Classe</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{activeRequest.class}</p>
                            </div>
                          )}

                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{activeRequest.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                      <button
                        onClick={() => handleAcceptRequest(activeRequest.userId)}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleRejectRequest(activeRequest.userId)}
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

// Composant pour l'élément de demande de connexion
interface ConnectionRequest {
  userId: string
  email: string
  firstName: string
  lastName: string
  profilePhoto: string
  role: string
  department: string | null
  class: string | null
  status: string
  sentAt: string
}
function ConnectionRequestItem({
  request,
  isActive,
  onClick,
  onAccept,
  onReject,
  isNew,
  formattedDate,
}: {
  request: ConnectionRequest
  isActive: boolean
  onClick: () => void
  onAccept: () => void
  onReject: () => void
  isNew: boolean
  formattedDate: string
}) {
  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50  ${isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={request.profilePhoto ? `/uploads/${request.profilePhoto}` : "/placeholder.svg"}
            alt={`${request.firstName} ${request.lastName}`}
            className="h-12 w-12 rounded-full object-cover"
          />
        </div>

        {/* Informations sur la demande */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3
              className="text-sm font-medium text-gray-900 dark:text-white truncate select-none cursor-pointer"
              onClick={onClick}
            >
              {request.firstName} {request.lastName}
            </h3>
            <span className="text-xs ml-2 text-gray-500 dark:text-gray-400 select-none">{formattedDate}</span>
          </div>

          {/* Rôle et informations spécifiques */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-1.5 py-0.5 text-xs rounded-full select-none ${
                request.role === "professor"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              {request.role === "professor" ? "Professeur" : "Étudiant"}
            </span>

            {request.role === "professor" && request.department && (
              <span className="text-xs select-none text-gray-600 dark:text-gray-400">{request.department}</span>
            )}

            {request.role === "student" && request.class && (
              <span className="text-xs select-none text-gray-600 dark:text-gray-400">{request.class}</span>
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
