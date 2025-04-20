"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Bell,
  BookOpen,
  ChevronDown,
  Grid,
  Hash,
  Home,
  Info,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings,
  User,
  Users,
  X,
  Pin,
  Filter,
} from "lucide-react"
import Logo from "@/components/logo"
import { useMediaQuery } from "@/hooks/use-mobile"

// Types
type DiscussionType = "individual" | "group" | "class" | "announcement"
type DiscussionCategory = "general" | "homework" | "exam" | "project" | "event" | "question"

interface DiscussionAuthor {
  id: number
  name: string
  avatar: string
  role: "student" | "teacher" | "admin"
  status?: "online" | "offline" | "away"
}

interface DiscussionMessage {
  id: number
  author: DiscussionAuthor
  content: string
  timestamp: string
  attachments?: {
    type: "image" | "document" | "link"
    name: string
    url: string
    size?: string
  }[]
  reactions?: {
    type: string
    count: number
    reacted: boolean
  }[]
}

interface Discussion {
  id: number
  title: string
  type: DiscussionType
  category: DiscussionCategory
  participants: DiscussionAuthor[]
  lastMessage: {
    author: DiscussionAuthor
    preview: string
    timestamp: string
    unread: boolean
  }
  pinned?: boolean
  messages?: DiscussionMessage[]
  course?: string
}

// Mock data
const discussions: Discussion[] = [
  {
    id: 1,
    title: "Groupe d'étude - Mathématiques",
    type: "group",
    category: "general",
    participants: [
      {
        id: 1,
        name: "Jean Dupont",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
        status: "online",
      },
      {
        id: 2,
        name: "Sophie Dubois",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
        status: "online",
      },
      {
        id: 3,
        name: "Lucas Moreau",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
        status: "offline",
      },
      {
        id: 4,
        name: "Mme. Martin",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "teacher",
        status: "away",
      },
    ],
    lastMessage: {
      author: {
        id: 2,
        name: "Sophie Dubois",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
      },
      preview: "Est-ce que quelqu'un peut m'aider avec l'exercice 5 ?",
      timestamp: "Il y a 10 min",
      unread: true,
    },
    pinned: true,
    messages: [
      {
        id: 1,
        author: {
          id: 1,
          name: "Jean Dupont",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "student",
        },
        content: "Bonjour à tous ! Qui est disponible pour réviser le chapitre sur les fonctions ce soir ?",
        timestamp: "Hier, 18:30",
      },
      {
        id: 2,
        author: {
          id: 3,
          name: "Lucas Moreau",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "student",
        },
        content: "Je suis libre à partir de 19h !",
        timestamp: "Hier, 18:45",
      },
      {
        id: 3,
        author: {
          id: 4,
          name: "Mme. Martin",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "teacher",
        },
        content:
          "N'oubliez pas de vous concentrer sur les dérivées et les limites, ce sont les points importants pour l'examen.",
        timestamp: "Hier, 19:15",
        attachments: [
          {
            type: "document",
            name: "Révision_Fonctions.pdf",
            url: "#",
            size: "2.4 MB",
          },
        ],
      },
      {
        id: 4,
        author: {
          id: 2,
          name: "Sophie Dubois",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "student",
        },
        content: "Est-ce que quelqu'un peut m'aider avec l'exercice 5 ? Je n'arrive pas à trouver la bonne approche.",
        timestamp: "Il y a 10 min",
      },
    ],
    course: "Mathématiques",
  },
  {
    id: 2,
    title: "Projet de Sciences - Groupe 3",
    type: "group",
    category: "project",
    participants: [
      {
        id: 1,
        name: "Jean Dupont",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
      },
      {
        id: 5,
        name: "Emma Petit",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
      },
      {
        id: 6,
        name: "Thomas Lefèvre",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
      },
      {
        id: 7,
        name: "M. Bernard",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "teacher",
      },
    ],
    lastMessage: {
      author: {
        id: 5,
        name: "Emma Petit",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
      },
      preview: "J'ai terminé ma partie sur l'énergie solaire",
      timestamp: "Hier",
      unread: false,
    },
    course: "Sciences Physiques",
  },
  {
    id: 3,
    title: "Mme. Martin",
    type: "individual",
    category: "general",
    participants: [
      {
        id: 1,
        name: "Jean Dupont",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
      },
      {
        id: 4,
        name: "Mme. Martin",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "teacher",
        status: "away",
      },
    ],
    lastMessage: {
      author: {
        id: 4,
        name: "Mme. Martin",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "teacher",
      },
      preview: "Voici les corrections de votre dernier devoir",
      timestamp: "Lun.",
      unread: false,
    },
    course: "Mathématiques",
  },
  {
    id: 4,
    title: "Terminale S - Annonces",
    type: "announcement",
    category: "general",
    participants: [
      {
        id: 8,
        name: "Direction",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "admin",
      },
      // Plus tous les élèves de la classe (non affiché)
    ],
    lastMessage: {
      author: {
        id: 8,
        name: "Direction",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "admin",
      },
      preview: "Rappel : la réunion parents-professeurs aura lieu le 15 juin",
      timestamp: "Lun.",
      unread: true,
    },
  },
  {
    id: 5,
    title: "Préparation Bac Français",
    type: "class",
    category: "exam",
    participants: [
      {
        id: 9,
        name: "Mme. Dubois",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "teacher",
      },
      // Plus tous les élèves du cours (non affiché)
    ],
    lastMessage: {
      author: {
        id: 9,
        name: "Mme. Dubois",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "teacher",
      },
      preview: "Voici les sujets probables pour l'oral",
      timestamp: "Ven.",
      unread: false,
    },
    course: "Français",
  },
  {
    id: 6,
    title: "Sophie Dubois",
    type: "individual",
    category: "general",
    participants: [
      {
        id: 1,
        name: "Jean Dupont",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
      },
      {
        id: 2,
        name: "Sophie Dubois",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
        status: "online",
      },
    ],
    lastMessage: {
      author: {
        id: 1,
        name: "Jean Dupont",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
      },
      preview: "On se retrouve à la bibliothèque à 16h ?",
      timestamp: "Mar.",
      unread: false,
    },
  },
  {
    id: 7,
    title: "Club Théâtre",
    type: "group",
    category: "event",
    participants: [
      {
        id: 1,
        name: "Jean Dupont",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
      },
      // Plus d'autres membres (non affiché)
    ],
    lastMessage: {
      author: {
        id: 10,
        name: "Léa Martin",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "student",
      },
      preview: "N'oubliez pas d'apporter vos costumes demain !",
      timestamp: "Mer.",
      unread: false,
    },
  },
]

export default function DiscussionsPage() {
  const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(discussions[0])
  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "direct" | "groups" | "classes">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false)
  const [showMobileDiscussionList, setShowMobileDiscussionList] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Filter discussions based on active tab and search
  const filteredDiscussions = discussions.filter((discussion) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "direct" && discussion.type === "individual") ||
      (activeTab === "groups" && discussion.type === "group") ||
      (activeTab === "classes" && (discussion.type === "class" || discussion.type === "announcement"))

    return matchesSearch && matchesTab
  })

  // Group discussions by pinned status
  const pinnedDiscussions = filteredDiscussions.filter((d) => d.pinned)
  const unpinnedDiscussions = filteredDiscussions.filter((d) => !d.pinned)

  // Group discussions by type for the "all" tab
  const individualDiscussions = unpinnedDiscussions.filter((d) => d.type === "individual")
  const groupDiscussions = unpinnedDiscussions.filter((d) => d.type === "group")
  const classDiscussions = unpinnedDiscussions.filter((d) => d.type === "class" || d.type === "announcement")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "") return
    // In a real app, this would send the message to the server
    console.log("Sending message:", newMessage)
    setNewMessage("")
  }

  // Effect to handle mobile view
  useEffect(() => {
    if (isMobile && activeDiscussion) {
      setShowMobileDiscussionList(false)
    }
  }, [activeDiscussion, isMobile])

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo and Search */}
            <div className="flex items-center gap-3 flex-1">
              <Link href="/home" className="flex items-center gap-2">
                <Logo />
                <span className="hidden sm:inline text-lg font-semibold text-gray-900 dark:text-white">
                  SchoolConnect
                </span>
              </Link>
              <div className="relative flex-1 max-w-xs ml-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <NavItem icon={<Home />} label="Accueil" href="/home" />
              <NavItem icon={<Users />} label="Réseau" href="/network" />
              <NavItem icon={<MessageCircle />} label="Discussions" href="/discussions" isActive />
              <NavItem icon={<Bell />} label="Notifications" href="/notifications" badge="3" />
              <div className="flex items-center pl-2 border-l border-gray-300 dark:border-gray-600">
                <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600 dark:text-gray-300" />
                </div>
                <div className="hidden sm:flex items-center text-xs text-gray-700 dark:text-gray-300">
                  <span className="mx-1">Moi</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-gray-300 dark:border-gray-600">
                <div className="flex flex-col items-center">
                  <Grid className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">Apps</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-5 h-[calc(100vh-10rem)]">
          {/* Discussions List - Hidden on mobile when viewing a discussion */}
          <div
            className={`w-full md:w-96 lg:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${
              !showMobileDiscussionList ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Discussions Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Discussions</h1>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Filter className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowNewDiscussionModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Nouvelle</span>
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une discussion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Tabs */}
              <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <button
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === "all"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("all")}
                  >
                    Tous
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === "direct"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("direct")}
                  >
                    Messages directs
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === "groups"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("groups")}
                  >
                    Groupes
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === "classes"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("classes")}
                  >
                    Classes
                  </button>
                </div>
              </div>
            </div>

            {/* Discussions List */}
            <div className="flex-1 overflow-y-auto">
              {filteredDiscussions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">Aucune discussion trouvée</div>
              ) : (
                <div>
                  {/* Pinned Discussions */}
                  {pinnedDiscussions.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 flex items-center">
                        <Pin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Épinglés
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {pinnedDiscussions.map((discussion) => (
                          <DiscussionItem
                            key={discussion.id}
                            discussion={discussion}
                            isActive={activeDiscussion?.id === discussion.id}
                            onClick={() => {
                              setActiveDiscussion(discussion)
                              setShowMobileDiscussionList(false)
                            }}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* All Discussions - Organized by type when on "all" tab */}
                  {activeTab === "all" ? (
                    <>
                      {/* Direct Messages */}
                      {individualDiscussions.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 flex items-center">
                            <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Messages directs
                            </span>
                          </div>
                          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {individualDiscussions.map((discussion) => (
                              <DiscussionItem
                                key={discussion.id}
                                discussion={discussion}
                                isActive={activeDiscussion?.id === discussion.id}
                                onClick={() => {
                                  setActiveDiscussion(discussion)
                                  setShowMobileDiscussionList(false)
                                }}
                              />
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Groups */}
                      {groupDiscussions.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 flex items-center">
                            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Groupes
                            </span>
                          </div>
                          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {groupDiscussions.map((discussion) => (
                              <DiscussionItem
                                key={discussion.id}
                                discussion={discussion}
                                isActive={activeDiscussion?.id === discussion.id}
                                onClick={() => {
                                  setActiveDiscussion(discussion)
                                  setShowMobileDiscussionList(false)
                                }}
                              />
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Classes */}
                      {classDiscussions.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 flex items-center">
                            <BookOpen className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Classes et annonces
                            </span>
                          </div>
                          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {classDiscussions.map((discussion) => (
                              <DiscussionItem
                                key={discussion.id}
                                discussion={discussion}
                                isActive={activeDiscussion?.id === discussion.id}
                                onClick={() => {
                                  setActiveDiscussion(discussion)
                                  setShowMobileDiscussionList(false)
                                }}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    // For other tabs, just show the filtered list without categories
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredDiscussions
                        .filter((d) => !d.pinned)
                        .map((discussion) => (
                          <DiscussionItem
                            key={discussion.id}
                            discussion={discussion}
                            isActive={activeDiscussion?.id === discussion.id}
                            onClick={() => {
                              setActiveDiscussion(discussion)
                              setShowMobileDiscussionList(false)
                            }}
                          />
                        ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Discussion Content - Hidden on mobile when viewing the list */}
          {activeDiscussion ? (
            <div
              className={`w-full md:flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${
                showMobileDiscussionList ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Discussion Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowMobileDiscussionList(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  {/* Avatar - Different for different discussion types */}
                  {activeDiscussion.type === "individual" ? (
                    <div className="relative">
                      <img
                        src={activeDiscussion.participants.find((p) => p.id !== 1)?.avatar || "/placeholder.svg"}
                        alt={activeDiscussion.title}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      {activeDiscussion.participants.find((p) => p.id !== 1)?.status === "online" && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                  ) : activeDiscussion.type === "group" ? (
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  ) : activeDiscussion.type === "class" ? (
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  )}

                  <div>
                    <h2 className="font-medium text-gray-900 dark:text-white">{activeDiscussion.title}</h2>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      {activeDiscussion.type === "individual" ? (
                        <span className="flex items-center">
                          {activeDiscussion.participants.find((p) => p.id !== 1)?.status === "online" ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                              En ligne
                            </>
                          ) : activeDiscussion.participants.find((p) => p.id !== 1)?.status === "away" ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 mr-1.5"></span>
                              Absent
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                              Hors ligne
                            </>
                          )}
                        </span>
                      ) : (
                        <span>{activeDiscussion.participants.length} participants</span>
                      )}
                      {activeDiscussion.course && (
                        <>
                          <span className="mx-1.5">•</span>
                          <Hash className="h-3 w-3 mr-0.5" />
                          <span>{activeDiscussion.course}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Search className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeDiscussion.messages ? (
                  activeDiscussion.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.author.id === 1 ? "justify-end" : "justify-start"} mb-4`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.author.id === 1 ? "flex-row-reverse" : ""}`}>
                        {message.author.id !== 1 && (
                          <img
                            src={message.author.avatar || "/placeholder.svg"}
                            alt={message.author.name}
                            className="h-8 w-8 rounded-full object-cover mt-1 flex-shrink-0"
                          />
                        )}
                        <div>
                          {message.author.id !== 1 && (
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                {message.author.name}
                              </span>
                              {message.author.role === "teacher" && (
                                <span className="px-1.5 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                  Prof
                                </span>
                              )}
                            </div>
                          )}
                          <div
                            className={`rounded-lg p-3 ${
                              message.author.id === 1
                                ? "bg-blue-600 dark:bg-blue-500 text-white rounded-tr-none"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none"
                            }`}
                          >
                            {message.content}
                          </div>

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2">
                              {message.attachments.map((attachment, index) => (
                                <div
                                  key={index}
                                  className={`mt-2 rounded-lg p-3 flex items-center gap-3 ${
                                    message.author.id === 1
                                      ? "bg-blue-500 dark:bg-blue-400 text-white"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                  }`}
                                >
                                  <div
                                    className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      message.author.id === 1
                                        ? "bg-blue-400 dark:bg-blue-300"
                                        : "bg-gray-200 dark:bg-gray-600"
                                    }`}
                                  >
                                    <Paperclip className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                                    {attachment.size && <p className="text-xs opacity-80">{attachment.size}</p>}
                                  </div>
                                  <a
                                    href={attachment.url}
                                    className={`p-1.5 rounded-full flex-shrink-0 ${
                                      message.author.id === 1
                                        ? "bg-blue-400 dark:bg-blue-300 hover:bg-blue-300 dark:hover:bg-blue-200"
                                        : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                                    }`}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                      <polyline points="7 10 12 15 17 10" />
                                      <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className={`flex gap-1 mt-1 ${message.author.id === 1 ? "justify-end" : ""}`}>
                              {message.reactions.map((reaction, index) => (
                                <button
                                  key={index}
                                  className={`px-2 py-0.5 rounded-full text-xs ${
                                    reaction.reacted
                                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                  }`}
                                >
                                  {reaction.type} {reaction.count}
                                </button>
                              ))}
                            </div>
                          )}

                          <div
                            className={`flex items-center mt-1 gap-1 ${message.author.id === 1 ? "justify-end" : ""}`}
                          >
                            <span className="text-xs text-gray-500 dark:text-gray-400">{message.timestamp}</span>
                            {message.author.id === 1 && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3 text-blue-600 dark:text-blue-400"
                              >
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                      <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                        Commencez la conversation
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Envoyez un message pour démarrer cette conversation
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="w-full p-3 pr-16 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px] max-h-[160px]"
                    ></textarea>
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button
                        type="button"
                        className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Paperclip className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="w-full md:flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
              <div className="text-center p-6">
                <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Aucune discussion sélectionnée
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Sélectionnez une conversation existante dans la liste ou créez-en une nouvelle
                </p>
                <button
                  onClick={() => setShowNewDiscussionModal(true)}
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle discussion
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Discussion Modal */}
      {showNewDiscussionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Nouvelle discussion</h2>
              <button
                onClick={() => setShowNewDiscussionModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de discussion
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 rounded-lg border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex flex-col items-center gap-2 transition-colors">
                      <User className="h-6 w-6" />
                      <span className="text-sm font-medium">Individuelle</span>
                    </button>
                    <button className="p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <Users className="h-6 w-6" />
                      <span className="text-sm font-medium">Groupe</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="recipients"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Sélectionnez un contact
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="recipients"
                      type="text"
                      placeholder="Rechercher un contact..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contacts disponibles
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                    {discussions
                      .filter((d) => d.type === "individual")
                      .map((d) => {
                        const otherPerson = d.participants.find((p) => p.id !== 1)
                        return (
                          <div
                            key={d.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                          >
                            <img
                              src={otherPerson?.avatar || "/placeholder.svg"}
                              alt={otherPerson?.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{otherPerson?.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {otherPerson?.role === "teacher" ? "Professeur" : "Élève"}
                              </p>
                            </div>
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewDiscussionModal(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Annuler
                </button>
                <button className="px-4 py-2 rounded-md bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                  Démarrer la discussion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 flex justify-between">
        <NavButton icon={<Home className="h-6 w-6" />} label="Accueil" href="/home" />
        <NavButton icon={<Users className="h-6 w-6" />} label="Réseau" href="/network" />
        <NavButton icon={<MessageCircle className="h-6 w-6" />} label="Discussions" href="/discussions" isActive />
        <NavButton icon={<Bell className="h-6 w-6" />} label="Notifications" href="/notifications" badge="3" />
        <NavButton icon={<User className="h-6 w-6" />} label="Profil" href="/profile" />
      </nav>
    </div>
  )
}

// Component for Discussion Item
function DiscussionItem({ discussion, isActive, onClick }: { discussion: Discussion; isActive: boolean; onClick: () => void }) {
  return (
    <li
      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
        isActive ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400" : ""
      }`}
      onClick={onClick}
    >
      <div className="p-3 flex items-start gap-3">
        {/* Avatar - Different for different discussion types */}
        <div className="relative flex-shrink-0">
          {discussion.type === "individual" ? (
            // For individual chats, show the other person's avatar
            <div className="relative">
              <img
                src={discussion.participants.find((p) => p.id !== 1)?.avatar || "/placeholder.svg"}
                alt={discussion.title}
                className="h-10 w-10 rounded-full object-cover"
              />
              {discussion.participants.find((p) => p.id !== 1)?.status === "online" && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
              )}
            </div>
          ) : discussion.type === "group" ? (
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          ) : discussion.type === "class" ? (
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          )}
        </div>

        {/* Discussion Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3
              className={`text-sm font-medium truncate ${
                discussion.lastMessage.unread ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {discussion.title}
            </h3>
            <span
              className={`text-xs ml-2 ${
                discussion.lastMessage.unread
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {discussion.lastMessage.timestamp}
            </span>
          </div>

          {/* Course Tag */}
          {discussion.course && (
            <div className="flex items-center gap-1 mt-0.5">
              <Hash className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{discussion.course}</span>
            </div>
          )}

          {/* Last Message Preview */}
          <p
            className={`text-xs truncate mt-1 ${
              discussion.lastMessage.unread
                ? "text-gray-700 dark:text-gray-300 font-medium"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <span className="font-medium">
              {discussion.lastMessage.author.id === 1 ? "Vous" : discussion.lastMessage.author.name}:{" "}
            </span>
            {discussion.lastMessage.preview}
          </p>

          {/* Indicators */}
          <div className="flex justify-between items-center mt-1">
            {discussion.pinned && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Pin className="h-3 w-3 text-amber-400 mr-1" />
                Épinglé
              </span>
            )}
            {discussion.lastMessage.unread && (
              <div className="bg-blue-600 dark:bg-blue-500 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 ml-auto">
                1
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

// Component for Navigation Item
function NavItem({ icon, label, isActive = false, badge, href = "#" }: { icon: React.ReactNode; label: string; isActive?: boolean; badge?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center px-1 sm:px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
        isActive ? "text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700" : "text-gray-500 dark:text-gray-400"
      }`}
    >
      <div className="relative">
        {icon}
        {badge && (
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-sm">
            {badge}
          </div>
        )}
      </div>
      <span className="hidden sm:block text-xs mt-0.5">{label}</span>
    </Link>
  )
}

// Component for Mobile Navigation Button
function NavButton({ icon, label, isActive = false, badge, href = "#" }: { icon: React.ReactNode; label: string; isActive?: boolean; badge?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center ${
        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
      }`}
    >
      <div className="relative">
        {icon}
        {badge && (
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-sm">
            {badge}
          </div>
        )}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </Link>
  )
}
