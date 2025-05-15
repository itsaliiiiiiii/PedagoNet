"use client"

import { useState, useEffect, useCallback } from "react"
import { User, AlertCircle, Filter, Search, Users, UserMinus, Mail, Building, GraduationCap, Check } from "lucide-react"
import DesktopNav from "@/components/navs/desktopnav"
import MobileNav from "@/components/navs/mobilenav"
import Link from "next/link"

export default function MyConnectionsPage() {
  // Types
  interface Connection {
    userId: string
    email: string
    firstName: string
    lastName: string
    profilePhoto: string
    role: string
    department: string | null
    class: string | null
    createdAt: string
  }

  // État
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    type: "success" | "error"
  } | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean
    userId: string
    userName: string
  } | null>(null)

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type })
    // Masquer le toast après 3 secondes
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  // Fonction pour charger les connexions
  const fetchConnections = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:8080/connections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch connections")
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch connections")
      }

      setConnections(data.connections || [])
    } catch (err: any) {
      console.error("Error fetching connections:", err)
      setError(err.message || "Une erreur est survenue lors du chargement des connexions.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialiser le chargement des connexions
  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  // Filtrer les connexions
  const filteredConnections = connections.filter((connection) => {
    const matchesSearch =
      searchQuery === "" ||
      `${connection.firstName} ${connection.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (connection.email && connection.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (connection.department && connection.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (connection.class && connection.class.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesRole = selectedRole === null || connection.role === selectedRole

    return matchesSearch && matchesRole
  })

  // Afficher le modal de confirmation
  const showConfirmModal = (userId: string, firstName: string, lastName: string) => {
    setConfirmModal({
      visible: true,
      userId,
      userName: `${firstName} ${lastName}`,
    })
  }

  // Gérer la suppression d'une connexion
  const handleRemoveConnection = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/connections/remove/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        setConnections(connections.filter((conn) => conn.userId !== userId))
        if (activeConnection?.userId === userId) {
          setActiveConnection(null)
        }
        showToast("Connexion supprimée avec succès", "success")
      } else {
        setError("Impossible de supprimer la connexion. Veuillez réessayer.")
        showToast("Impossible de supprimer la connexion", "error")
      }
    } catch (error) {
      console.error("Error removing connection:", error)
      setError("Une erreur est survenue lors de la suppression de la connexion.")
      showToast("Une erreur est survenue lors de la suppression de la connexion", "error")
    } finally {
      setConfirmModal(null)
    }
  }

  // Format date for display
  const formatConnectionDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Aujourd'hui"
    if (diffInDays === 1) return "Hier"
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`

    // Format as date for older connections
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
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
                    className="flex items-center gap-2 p-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium rounded-md"
                  >
                    <Users className="h-4 w-4" />
                    <span>Mes connexions</span>
                    {connections.length > 0 && (
                      <span className="ml-auto bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {connections.length}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/network/requests"
                    className="flex items-center gap-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  >
                    <User className="h-4 w-4" />
                    <span>Demandes de connexion</span>
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

          {/* Main Content - Connections */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mes connexions</h1>
                </div>

                {/* Search */}
                <div className="mt-3 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une connexion..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Filters - Now visible on all screen sizes */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      selectedRole === null
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setSelectedRole("professor")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      selectedRole === "professor"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Professeurs
                  </button>
                  <button
                    onClick={() => setSelectedRole("student")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      selectedRole === "student"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Étudiants
                  </button>
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
              {!loading && !error && filteredConnections.length === 0 && (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucune connexion trouvée</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery || selectedRole
                      ? "Aucune connexion ne correspond à vos critères de recherche."
                      : "Vous n'avez pas encore de connexions. Commencez à vous connecter avec d'autres utilisateurs."}
                  </p>
                  {(searchQuery || selectedRole) && (
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedRole(null)
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}

              {/* Connections List */}
              {!loading && !error && filteredConnections.length > 0 && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredConnections.map((connection) => (
                    <div
                      key={connection.userId}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        activeConnection?.userId === connection.userId ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative">
                          <img
                            src={connection.profilePhoto ? `/uploads/${connection.profilePhoto}` : "/placeholder.svg"}
                            alt={`${connection.firstName} ${connection.lastName}`}
                            className="h-12 w-12 rounded-full object-cover"
                            onClick={() =>
                              setActiveConnection(connection.userId === activeConnection?.userId ? null : connection)
                            }
                          />
                        </div>

                        {/* Informations sur la connexion */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3
                              className="text-sm font-medium text-gray-900 dark:text-white truncate select-none cursor-pointer"
                              onClick={() =>
                                setActiveConnection(connection.userId === activeConnection?.userId ? null : connection)
                              }
                            >
                              {connection.firstName} {connection.lastName}
                            </h3>
                            <span className="text-xs ml-2 text-gray-500 dark:text-gray-400 select-none">
                              {connection.createdAt ? formatConnectionDate(connection.createdAt) : ""}
                            </span>
                          </div>

                          {/* Rôle et informations spécifiques */}
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-1.5 py-0.5 text-xs rounded-full select-none ${
                                connection.role === "professor"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              }`}
                            >
                              {connection.role === "professor" ? "Professeur" : "Étudiant"}
                            </span>

                            {connection.role === "professor" && connection.department && (
                              <span className="text-xs select-none text-gray-600 dark:text-gray-400">
                                {connection.department}
                              </span>
                            )}

                            {connection.role === "student" && connection.class && (
                              <span className="text-xs select-none text-gray-600 dark:text-gray-400">
                                {connection.class}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => (window.location.href = `mailto:${connection.email}`)}
                          className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Envoyer un email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => showConfirmModal(connection.userId, connection.firstName, connection.lastName)}
                          className="p-1.5 rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Supprimer la connexion"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Connection Details */}
              {activeConnection && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      {/* Profile Image */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            activeConnection.profilePhoto
                              ? `/uploads/${activeConnection.profilePhoto}`
                              : "/placeholder.svg"
                          }
                          alt={`${activeConnection.firstName} ${activeConnection.lastName}`}
                          className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-sm"
                        />
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {activeConnection.firstName} {activeConnection.lastName}
                        </h2>

                        {/* Role Badge */}
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activeConnection.role === "professor"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                          >
                            {activeConnection.role === "professor" ? "Professeur" : "Étudiant"}
                          </span>
                        </div>

                        {/* Date de connexion */}
                        <div className="mt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Connecté depuis{" "}
                            {activeConnection.createdAt ? formatConnectionDate(activeConnection.createdAt) : ""}
                          </span>
                        </div>

                        {/* Informations utilisateur */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                              {activeConnection.email}
                            </p>
                          </div>

                          {activeConnection.role === "professor" && activeConnection.department && (
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Département</p>
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {activeConnection.department}
                              </p>
                            </div>
                          )}

                          {activeConnection.role === "student" && activeConnection.class && (
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Classe</p>
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {activeConnection.class}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                      <button
                        onClick={() => (window.location.href = `mailto:${activeConnection.email}`)}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Contacter
                      </button>
                      <button
                        onClick={() =>
                          showConfirmModal(
                            activeConnection.userId,
                            activeConnection.firstName,
                            activeConnection.lastName,
                          )
                        }
                        className="px-6 py-2.5 rounded-lg border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2"
                      >
                        <UserMinus className="h-4 w-4" />
                        Supprimer la connexion
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal with transparent background */}
      {confirmModal && confirmModal.visible && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <UserMinus className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Supprimer la connexion
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Êtes-vous sûr de vouloir supprimer la connexion avec{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">{confirmModal.userName}</span> ?
                        Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleRemoveConnection(confirmModal.userId)}
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {toast.type === "success" ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <MobileNav />
    </div>
  )
}
