"use client"

import type React from "react"

import { BookOpen, Users, FileText, Download, ArrowLeft, Plus, Calendar, Upload, Award } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import DesktopNav from "@/components/navs/desktopnav"
import MobileNav from "@/components/navs/mobilenav"
import { useParams, useRouter } from "next/navigation"
import { useRole } from "../../context/RoleContext"

// const classroomData = {
//   id: 1,
//   name: "Mathématiques Avancées",
//   code: "MATH301",
//   teacher: "Prof. Martin Dubois",
//   students: 28,
//   description: "Cours de mathématiques niveau avancé couvrant l'algèbre linéaire et le calcul différentiel.",
//   color: "bg-blue-500",
//   assignments: [
//     {
//       id: 1,
//       title: "Devoir 3 - Systèmes linéaires",
//       dueDate: "2024-01-20",
//       status: "pending",
//       points: 20,
//     },
//     {
//       id: 2,
//       title: "Projet final - Application des matrices",
//       dueDate: "2024-02-15",
//       status: "assigned",
//       points: 50,
//     },
//   ],
//   resources: [
//     {
//       id: 1,
//       name: "Chapitre 4 - Algèbre linéaire.pdf",
//       type: "pdf",
//       size: "2.3 MB",
//       uploadDate: "2024-01-05",
//     },
//     {
//       id: 2,
//       name: "Exercices corrigés.pdf",
//       type: "pdf",
//       size: "1.8 MB",
//       uploadDate: "2024-01-03",
//     },
//   ],
// }

// Données d'exemple pour les soumissions
const submissionsData = [
  {
    id: 1,
    studentName: "Alice Dupont",
    submissionDate: "2024-01-18T14:30:00",
    status: "graded",
    score: 18,
    maxScore: 20,
    feedback: "Excellent travail, très bonne compréhension des concepts.",
    file: "devoir3_alice.pdf",
  },
  {
    id: 2,
    studentName: "Thomas Martin",
    submissionDate: "2024-01-19T09:15:00",
    status: "graded",
    score: 15,
    maxScore: 20,
    feedback: "Bon travail, quelques erreurs mineures.",
    file: "devoir3_thomas.pdf",
  },
  {
    id: 3,
    studentName: "Sophie Bernard",
    submissionDate: "2024-01-19T23:45:00",
    status: "submitted",
    score: null,
    maxScore: 20,
    feedback: "",
    file: "devoir3_sophie.pdf",
  },
]

function formatDeadline(deadlineObj: any) {
  if (!deadlineObj) return "Date inconnue"

  // Récupérer les valeurs .low (parfois utilisées par certains drivers de base de données)
  const year = deadlineObj.year?.low ?? 0
  const month = (deadlineObj.month?.low ?? 1) - 1 // JS months 0-based
  const day = deadlineObj.day?.low ?? 1
  const hour = deadlineObj.hour?.low ?? 0
  const minute = deadlineObj.minute?.low ?? 0
  const second = deadlineObj.second?.low ?? 0

  const date = new Date(year, month, day, hour, minute, second)

  // Format en FR par exemple
  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState("assignments")
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [viewingTaskDetails, setViewingTaskDetails] = useState<{ id: number; title: string } | null>(null)
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const role = useRole()
  const [taskForm, setTaskForm] = useState({
    name: "",
    description: "",
    deadline: "",
    points: "10",
    file: null as File | null,
  })
  const [submissionForm, setSubmissionForm] = useState({
    comment: "",
    file: null as File | null,
  })

  const router = useRouter()
  params = useParams()
  const classroomId = params.id

  const [tasksData, setTasksData] = useState([])
  const [classroomData,setClassroomData]=useState({})


  useEffect(() => {
    async function getClassroomData(){
      const response = await fetch(`http://localhost:8080/classrooms/${classroomId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const data = await response.json()


      if (!data.success) {
        throw new Error(data.message || "Failed to fetch tasks")
      }
      console.log(data.classroom)

      data.classroom.color = localStorage.getItem('color')

      setClassroomData(data.classroom)
    }
    async function getTasks() {
      try {
        const response = await fetch(`http://localhost:8080/tasks/${classroomId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch tasks")
        }

        const data = await response.json()

        // console.log(data.data);

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch tasks")
        }

        const mapped = data.data.map((task: any) => {
          return {
            id: task.id_task,
            description: task.descitpion,
            maxscore: task.maxScore,
            title: task.title,
            deadline: task.deadline,
            attachments:task.attachments[0]
          }
        })
        setTasksData(mapped)
      } catch (error) {
        console.error("Error fetching tasks:", error)
        // Utiliser les données d'exemple en cas d'erreur
        setTasksData(classroomData.assignments)
      }
    }
    
    getClassroomData()
    getTasks()
  }, [classroomId])

  const handleTaskFormChange = (field: string, value: string | File | null) => {
    setTaskForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmissionFormChange = (field: string, value: string | File | null) => {
    setSubmissionForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, formType: "task" | "submission") => {
    const file = e.target.files?.[0] || null
    if (formType === "task") {
      handleTaskFormChange("file", file)
    } else {
      handleSubmissionFormChange("file", file)
    }
  }

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("title", taskForm.name)
    formData.append("description", taskForm.description)
    formData.append("deadline", taskForm.deadline)
    formData.append("maxScore", taskForm.points)

    if (taskForm.file) {
      formData.append("attachments", taskForm.file)
    }

    try {
      const response = await fetch(`http://localhost:8080/tasks/${classroomId}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        // Add the new task to the tasks list
        if (data.success) {
          console.log("success");
          // const newTask = {
          //   id: data.task.id_task,
          //   title: data.task.title,
          //   description: data.task.description,
          //   deadline: data.task.deadline,
          //   maxscore: data.task.maxScore,
          // }
          // setTasksData([...tasksData, newTask])
        }

        // Reset form and return to tasks view
        setTaskForm({ name: "", description: "", deadline: "", points: "10", file: null })
        setIsAddingTask(false)
        setActiveTab("assignments")
      } else {
        console.error("Error creating task:", await response.text())
        alert("Erreur lors de la création de la tâche")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      alert("Erreur lors de la création de la tâche")
    }
  }

  const handleSubmitSubmission = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!viewingTaskDetails) return

    const formData = new FormData()
    formData.append("taskId", viewingTaskDetails.id.toString())
    formData.append("comment", submissionForm.comment)
    if (submissionForm.file) {
      formData.append("file", submissionForm.file)
    }

    try {
      // Simuler l'envoi de la soumission
      console.log("Submitting:", formData)

      // Reset form and return to tasks view
      setSubmissionForm({ comment: "", file: null })
      setViewingTaskDetails(null)
      setIsSubmittingTask(false)

      // Afficher un message de succès
      alert("Soumission envoyée avec succès!")
    } catch (error) {
      console.error("Error submitting task:", error)
    }
  }

  const handleViewTaskDetails = (task: any) => {
    setViewingTaskDetails({ id: task.id, title: task.title })
    if (role === "student") {
      setIsSubmittingTask(true)
    }
  }

  const classroom = classroomData

  const tabs = [{ id: "assignments", label: "Devoirs", icon: FileText }]

  // Fonction pour déterminer le statut basé sur la deadline
  const getTaskStatus = (deadline: any) => {
    if (!deadline) return { label: "En cours", style: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" }

    const now = new Date()

    // Récupérer la date de deadline
    const year = deadline.year?.low ?? 0
    const month = (deadline.month?.low ?? 1) - 1 // JS months 0-based
    const day = deadline.day?.low ?? 1
    const hour = deadline.hour?.low ?? 0
    const minute = deadline.minute?.low ?? 0
    const second = deadline.second?.low ?? 0

    const deadlineDate = new Date(year, month, day, hour, minute, second)

    if (deadlineDate < now) {
      return {
        label: "Terminé",
        style: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      }
    } else {
      return {
        label: "En cours",
        style: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      }
    }
  }

  // Fonction pour formater la date de soumission
  const formatSubmissionDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation principale */}
      <DesktopNav />
      <MobileNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link
              href="/classroom"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour aux classrooms
            </Link>
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-lg ${classroom.color} flex items-center justify-center`}>
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{classroom.name}</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {classroom.code}
                </span>
              </div>
              {/* <p className="text-gray-600 dark:text-gray-400 mb-2">{classroom.teacher}</p> */}
              <p className="text-sm text-gray-500 dark:text-gray-400">{classroom.description}</p>
              
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Vue principale des devoirs */}
          {!isAddingTask && !viewingTaskDetails && (
            <>
              {/* Assignments Tab */}
              {activeTab === "assignments" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Devoirs</h2>
                    {role === "professor" && (
                      <button
                        onClick={() => setIsAddingTask(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une tâche
                      </button>
                    )}
                  </div>
                  {tasksData.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-6 pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {assignment.title}
                              </h3>
                              <div className="flex items-center bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                <Award className="h-3.5 w-3.5 mr-1" />
                                {assignment.maxscore} points
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                              <Calendar className="h-4 w-4 mr-1 inline" />À rendre le{" "}
                              {formatDeadline(assignment.deadline)}
                            </p>
                          </div>
                          {(() => {
                            const status = getTaskStatus(assignment.deadline)
                            return (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.style}`}
                              >
                                {status.label}
                              </span>
                            )
                          })()}
                        </div>
                      </div>
                      <div className="px-6 pb-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewTaskDetails(assignment)}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                          >
                            Voir les détails
                          </button>
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors duration-200">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Vue d'ajout de tâche (professeur uniquement) */}
          {isAddingTask && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ajouter une nouvelle tâche</h2>
              </div>

              <form onSubmit={handleSubmitTask} className="p-6 space-y-6">
                <div>
                  <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de la tâche
                  </label>
                  <input
                    type="text"
                    id="taskName"
                    value={taskForm.name}
                    onChange={(e) => handleTaskFormChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="Ex: Devoir de mathématiques"
                  />
                </div>

                <div>
                  <label
                    htmlFor="taskDescription"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="taskDescription"
                    value={taskForm.description}
                    onChange={(e) => handleTaskFormChange("description", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="Décrivez la tâche à accomplir..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="taskDeadline"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Date limite
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        id="taskDeadline"
                        value={taskForm.deadline}
                        onChange={(e) => handleTaskFormChange("deadline", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="taskPoints"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Points
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="taskPoints"
                        min="1"
                        max="100"
                        value={taskForm.points}
                        onChange={(e) => handleTaskFormChange("points", e.target.value)}
                        className="w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <Award className="absolute left-3 top-2.5 h-5 w-5 text-amber-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="taskFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fichier joint (optionnel)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="taskFile"
                      onChange={(e) => handleFileChange(e, "task")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <Upload className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  {taskForm.file && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Fichier sélectionné: {taskForm.file.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTask(false)
                      setTaskForm({ name: "", description: "", deadline: "", points: "10", file: null })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                  >
                    Confirmer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Vue de détail de tâche pour professeur (liste des soumissions) */}
          {viewingTaskDetails && role === "professor" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Soumissions pour: {viewingTaskDetails.title}
                  </h2>
                  <button
                    onClick={() => setViewingTaskDetails(null)}
                    className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Retour
                  </button>
                </div>
              </div>

              <div className="p-6">
                {submissionsData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Étudiant
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Date de soumission
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Statut
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Note
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {submissionsData.map((submission) => (
                          <tr key={submission.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {submission.studentName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatSubmissionDate(submission.submissionDate)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  submission.status === "graded"
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                    : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                }`}
                              >
                                {submission.status === "graded" ? "Noté" : "Soumis"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {submission.score !== null ? (
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {submission.score}/{submission.maxScore}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 dark:text-gray-400">Non noté</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                                  Voir
                                </button>
                                {submission.status !== "graded" && (
                                  <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                                    Noter
                                  </button>
                                )}
                                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                      <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune soumission</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Aucun étudiant n'a encore soumis de travail pour ce devoir.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vue de soumission de devoir pour étudiant */}
          {viewingTaskDetails && role === "student" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Soumettre: {viewingTaskDetails.title}
                  </h2>
                  <button
                    onClick={() => {
                      setViewingTaskDetails(null)
                      setIsSubmittingTask(false)
                    }}
                    className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Retour
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitSubmission} className="p-6 space-y-6">
                <div>
                  <label
                    htmlFor="submissionComment"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    id="submissionComment"
                    value={submissionForm.comment}
                    onChange={(e) => handleSubmissionFormChange("comment", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ajoutez un commentaire à votre soumission..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="submissionFile"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Fichier de soumission
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="submissionFile"
                      onChange={(e) => handleFileChange(e, "submission")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    <Upload className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  {submissionForm.file && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Fichier sélectionné: {submissionForm.file.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setViewingTaskDetails(null)
                      setIsSubmittingTask(false)
                      setSubmissionForm({ comment: "", file: null })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                  >
                    Soumettre
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
