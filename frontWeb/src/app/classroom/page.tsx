"use client"

import React from "react"
import { BookOpen, User, Plus, Search, X } from "lucide-react"
import Link from "next/link"
import DesktopNav from "@/components/navs/desktopnav"
import MobileNav from "@/components/navs/mobilenav"
import { useEffect, useState } from "react"
import { useRole } from "../context/RoleContext"

interface Classroom {
  id: string;
  avatar: React.ReactNode;
  avatarBg: string;
  name: string;
  color: string;
  code: string;
  description: string;
}

// Données d'exemple - à remplacer par des données réelles depuis votre API

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getColorFromId(id: string | number) {
  const colors = [
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-yellow-800", // brun
    "bg-red-500",
  ]

  // Convertir l'ID en string et sommer les codes caractères
  const hash = String(id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

  // Sélectionner une couleur de manière déterministe
  return colors[hash % colors.length]
}

const handleJoinCourse = async (
  e: React.FormEvent,
  courseCode: string,
  setIsJoinModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setCourseCode: React.Dispatch<React.SetStateAction<string>>,
  fetchClassrooms: () => void,
) => {
  e.preventDefault()
  if (!courseCode.trim()) return

  try {
    const response = await fetch("http://localhost:8080/classrooms/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ code: courseCode.trim() }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || "Erreur lors de la tentative de rejoindre le cours")
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || "Erreur lors de la tentative de rejoindre le cours")
    }

    // Fermer le modal et réinitialiser le code
    setIsJoinModalOpen(false)
    setCourseCode("")

    // Rafraîchir la liste des classrooms
    fetchClassrooms()
  } catch (error) {
    console.error("Erreur lors de la tentative de rejoindre le cours:", error)
    alert(error instanceof Error ? error.message : "Erreur lors de la tentative de rejoindre le cours")
  }
}

const handleCreateClassroom = async (
  e: React.FormEvent,
  classroomName: string,
  classroomDescription: string,
  generatedCode: string,
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setClassroomName: React.Dispatch<React.SetStateAction<string>>,
  setClassroomDescription: React.Dispatch<React.SetStateAction<string>>,
  setGeneratedCode: React.Dispatch<React.SetStateAction<string>>,
  fetchClassrooms: () => void,
) => {
  e.preventDefault()


  try {
    const response = await fetch(`http://localhost:8080/classrooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: classroomName.trim(),
        description: classroomDescription.trim(),
        code: generatedCode,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create classroom")
    }

    const data = await response.json()
    console.log(data)

    if (!data.success) {
      throw new Error(data.message || "Failed to create classroom")
    }

    // Fermer le modal et réinitialiser les champs
    setIsCreateModalOpen(false)
    setClassroomName("")
    setClassroomDescription("")
    setGeneratedCode("")

    // Rafraîchir la liste des classrooms
    fetchClassrooms()
  } catch (error) {
    console.error("Erreur lors de la création du classroom:", error)
    alert("Erreur lors de la création du classroom.")
  }
}

export default function ClassroomPage() {

  const role = useRole()

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [courseCode, setCourseCode] = useState("")
  const [userRole, setUserRole] = useState(role) // Changer en "professor" pour tester
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [classroomName, setClassroomName] = useState("")
  const [classroomDescription, setClassroomDescription] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")

  const generateClassroomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const fetchClassrooms = async () => {
    const response = await fetch(`http://localhost:8080/classrooms`, {
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

    //   console.log(data);
    const mapped = data.classrooms.map((classe: any) => {
      // const isProfessor = classe.author.role === "professor";
      const isProfessor = true
      // const isStudent = classe.author.role === "student";
      const isStudent = false

      // localStorage.setItem('classroomData',mapped)

      return {
        id: classe.id_classroom,
        avatar: <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
        avatarBg: isProfessor
          ? "bg-purple-100 dark:bg-purple-900/30"
          : isStudent
            ? "bg-blue-100 dark:bg-blue-900/30"
            : "bg-gray-100 dark:bg-gray-700",
        name: `${classe.name}`,
        color: getColorFromId(classe.id_classroom),
        code:`${classe.code}`,

        description: `${classe.description}`,
      }
    })
    setClassrooms(mapped)
  }

  useEffect(() => {
    fetchClassrooms()
  }, [])

  function saveClassroomData(classroom) {
    localStorage.setItem('color', classroom.color)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation principale */}
      <DesktopNav />
      <MobileNav />

      {/* Contenu principal */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Classrooms</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gérez vos cours et suivez votre progression académique
            </p>
          </div>
          {userRole === "student" ? (
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Rejoindre un cours
            </button>
          ) : userRole === "professor" ? (
            <button
              onClick={() => {
                setGeneratedCode(generateClassroomCode())
                setIsCreateModalOpen(true)
              }}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un classroom
            </button>
          ) :  null}
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cours actifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{classrooms.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Classroom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
            >
              {/* Card Header */}
              <div className="p-6 pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg ${classroom.color} flex items-center justify-center mb-3`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {classroom.code}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{classroom.name}</h3>
                {/* <p className="text-sm text-gray-600 dark:text-gray-400">{classroom.teacher}</p> */}
              </div>

              {/* Card Content */}
              <div className="px-6 pb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{classroom.description}</p>
                <div className="flex gap-2">
                  <Link
                    onClick={() => saveClassroomData(classroom)}
                    href={`/classroom/${classroom.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    Accéder
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (si aucun classroom) */}
        {classrooms.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun classroom trouvé</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Vous n'êtes inscrit à aucun cours pour le moment.</p>
           
          </div>
        )}
        {/* Modal Rejoindre un cours */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Arrière-plan transparent */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsJoinModalOpen(false)} />

            {/* Contenu du modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6">
              {/* Header du modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Rejoindre un cours</h2>
                <button
                  onClick={() => setIsJoinModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={(e) => handleJoinCourse(e, courseCode, setIsJoinModalOpen, setCourseCode, fetchClassrooms)}>
                <div className="mb-6">
                  <label
                    htmlFor="courseCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Code du cours
                  </label>
                  <input
                    type="text"
                    id="courseCode"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="Entrez le code du cours"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Demandez le code à votre professeur</p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Rejoindre
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal Créer un classroom */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Arrière-plan transparent */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsCreateModalOpen(false)}
            />

            {/* Contenu du modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6">
              {/* Header du modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Créer un classroom</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Formulaire */}
              <form
                onSubmit={(e) =>
                  handleCreateClassroom(
                    e,
                    classroomName,
                    classroomDescription,
                    generatedCode,
                    setIsCreateModalOpen,
                    setClassroomName,
                    setClassroomDescription,
                    setGeneratedCode,
                    fetchClassrooms,
                  )
                }
              >
                <div className="mb-4">
                  <label
                    htmlFor="classroomName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Nom du cours
                  </label>
                  <input
                    type="text"
                    id="classroomName"
                    value={classroomName}
                    onChange={(e) => setClassroomName(e.target.value)}
                    placeholder="Ex: Mathématiques Avancées"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="classroomDescription"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="classroomDescription"
                    value={classroomDescription}
                    onChange={(e) => setClassroomDescription(e.target.value)}
                    placeholder="Décrivez le contenu et les objectifs du cours..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code du cours (généré automatiquement)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={generatedCode}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 font-mono text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setGeneratedCode(generateClassroomCode())}
                      className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      Régénérer
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Les étudiants utiliseront ce code pour rejoindre votre cours
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
