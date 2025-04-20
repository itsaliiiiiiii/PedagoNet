import Link from "next/link"
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Filter,
  Home,
  ListTodo,
  MessageCircle,
  MessagesSquare,
  Plus,
  Search,
  Tag,
  ThumbsUp,
  User,
} from "lucide-react"
import Logo from "@/components/logo"

// Mock data for discussion categories
const categories = [
  { id: 1, name: "Général", count: 124, color: "indigo" },
  { id: 2, name: "Mathématiques", count: 87, color: "violet" },
  { id: 3, name: "Physique", count: 56, color: "amber" },
  { id: 4, name: "Informatique", count: 93, color: "emerald" },
  { id: 5, name: "Langues", count: 42, color: "rose" },
  { id: 6, name: "Événements", count: 31, color: "blue" },
  { id: 7, name: "Aide aux devoirs", count: 78, color: "orange" },
]

// Mock data for discussions
const discussions = [
  {
    id: 1,
    title: "Comment résoudre les équations différentielles du second ordre ?",
    author: "Marie Laurent",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Mathématiques",
    categoryColor: "violet",
    date: "Il y a 2 heures",
    replies: 12,
    likes: 8,
    views: 156,
    isHot: true,
    isPinned: true,
    lastReply: {
      author: "Prof. Bernard",
      date: "Il y a 30 minutes",
    },
    tags: ["Équations", "Aide"],
  },
  {
    id: 2,
    title: "Organisation d'une session de révision pour les examens finaux",
    author: "Thomas Dubois",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Événements",
    categoryColor: "blue",
    date: "Hier",
    replies: 24,
    likes: 32,
    views: 210,
    isHot: true,
    isPinned: false,
    lastReply: {
      author: "Sophie Martin",
      date: "Il y a 3 heures",
    },
    tags: ["Révisions", "Examens"],
  },
  {
    id: 3,
    title: "Ressources pour apprendre le développement web",
    author: "Lucas Moreau",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Informatique",
    categoryColor: "emerald",
    date: "Il y a 2 jours",
    replies: 18,
    likes: 15,
    views: 189,
    isHot: false,
    isPinned: false,
    lastReply: {
      author: "Emma Petit",
      date: "Il y a 12 heures",
    },
    tags: ["Web", "Ressources"],
  },
  {
    id: 4,
    title: "Conseils pour la rédaction du mémoire de fin d'études",
    author: "Julie Leroy",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Général",
    categoryColor: "indigo",
    date: "Il y a 3 jours",
    replies: 9,
    likes: 11,
    views: 142,
    isHot: false,
    isPinned: false,
    lastReply: {
      author: "Prof. Martin",
      date: "Il y a 1 jour",
    },
    tags: ["Mémoire", "Rédaction"],
  },
  {
    id: 5,
    title: "Problème avec les exercices de mécanique quantique",
    author: "Alexandre Dupont",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Physique",
    categoryColor: "amber",
    date: "Il y a 4 jours",
    replies: 7,
    likes: 5,
    views: 98,
    isHot: false,
    isPinned: false,
    lastReply: {
      author: "Prof. Dubois",
      date: "Il y a 2 jours",
    },
    tags: ["Mécanique", "Exercices"],
  },
  {
    id: 6,
    title: "Conseils pour améliorer son niveau en anglais technique",
    author: "Sophie Martin",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Langues",
    categoryColor: "rose",
    date: "Il y a 5 jours",
    replies: 15,
    likes: 18,
    views: 176,
    isHot: false,
    isPinned: false,
    lastReply: {
      author: "Claire Petit",
      date: "Il y a 1 jour",
    },
    tags: ["Anglais", "Conseils"],
  },
  {
    id: 7,
    title: "Aide avec les algorithmes de tri en Java",
    author: "Maxime Lefevre",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Informatique",
    categoryColor: "emerald",
    date: "Il y a 6 jours",
    replies: 11,
    likes: 9,
    views: 132,
    isHot: false,
    isPinned: false,
    lastReply: {
      author: "Lucas Moreau",
      date: "Il y a 3 jours",
    },
    tags: ["Java", "Algorithmes"],
  },
]

export default function ForumPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Search */}
            <div className="flex items-center gap-3 flex-1">
              <Link href="/home" className="flex items-center gap-2">
                <Logo />
              </Link>
              <div className="relative flex-1 max-w-md ml-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher des discussions..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <NavItem icon={<Home />} label="Accueil" href="/home" />
              <NavItem icon={<BookOpen />} label="Cours" href="/courses" />
              <NavItem icon={<ListTodo />} label="Tâches" href="/tasks" />
              <NavItem icon={<MessagesSquare />} label="Messages" href="/messages" />
              <NavItem icon={<MessageCircle />} label="Forum" href="/forum" isActive />
              <NavItem icon={<Bell />} label="Notifications" href="/notifications" badge="3" />
              <div className="flex items-center pl-2 border-l border-slate-300 dark:border-slate-700">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-md">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></div>
                </div>
                <div className="hidden sm:flex items-center text-xs text-slate-700 dark:text-slate-300 ml-2">
                  <span className="font-medium">Jean Dupont</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Catégories</h2>
                </div>
                <div className="p-2">
                  <ul className="space-y-1">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/forum/category/${category.id}`}
                          className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex items-center">
                            <div
                              className={`h-3 w-3 rounded-full bg-${category.color}-500 dark:bg-${category.color}-400 mr-2`}
                            ></div>
                            <span>{category.name}</span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{category.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Tags populaires</h2>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/forum/tag/examens"
                      className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Examens
                    </Link>
                    <Link
                      href="/forum/tag/devoirs"
                      className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Devoirs
                    </Link>
                    <Link
                      href="/forum/tag/projets"
                      className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Projets
                    </Link>
                    <Link
                      href="/forum/tag/aide"
                      className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Aide
                    </Link>
                    <Link
                      href="/forum/tag/ressources"
                      className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Ressources
                    </Link>
                    <Link
                      href="/forum/tag/conseils"
                      className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Conseils
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Statistiques</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Discussions</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">512</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Messages</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">2,845</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Membres</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">1,204</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Dernier membre</span>
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Sophie L.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Forum Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forum de discussion</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                      Échangez avec vos camarades et professeurs sur divers sujets académiques
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filtrer
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Nouvelle discussion
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Discussions List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="font-semibold text-slate-900 dark:text-white">Discussions récentes</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Trier par:</span>
                  <select className="text-sm bg-slate-100 dark:bg-slate-700 border-none rounded-md text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400">
                    <option>Plus récent</option>
                    <option>Plus populaire</option>
                    <option>Plus de réponses</option>
                    <option>Plus de vues</option>
                  </select>
                </div>
              </div>
              <div>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {discussions.map((discussion) => (
                    <li key={discussion.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <Link href={`/forum/discussion/${discussion.id}`} className="block p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={discussion.authorAvatar || "/placeholder.svg"}
                            alt={discussion.author}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {discussion.isPinned && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-xs font-medium text-indigo-800 dark:text-indigo-300">
                                  Épinglé
                                </span>
                              )}
                              {discussion.isHot && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-xs font-medium text-rose-800 dark:text-rose-300">
                                  Populaire
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full bg-${discussion.categoryColor}-100 dark:bg-${discussion.categoryColor}-900/30 text-xs font-medium text-${discussion.categoryColor}-800 dark:text-${discussion.categoryColor}-300`}
                              >
                                {discussion.category}
                              </span>
                              {discussion.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1"
                                >
                                  <Tag className="h-3 w-3" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <h3 className="mt-2 text-base font-medium text-slate-900 dark:text-white">
                              {discussion.title}
                            </h3>
                            <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <span>Par {discussion.author}</span>
                              <span className="mx-2">•</span>
                              <span>{discussion.date}</span>
                            </div>
                            <div className="mt-3 flex items-center gap-4">
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">{discussion.replies} réponses</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <ThumbsUp className="h-4 w-4" />
                                <span className="text-xs">{discussion.likes} likes</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
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
                                  className="h-4 w-4"
                                >
                                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span className="text-xs">{discussion.views} vues</span>
                              </div>
                            </div>
                          </div>
                          <div className="hidden sm:block text-right text-xs text-slate-500 dark:text-slate-400">
                            <div>Dernière réponse</div>
                            <div className="font-medium text-slate-700 dark:text-slate-300">
                              {discussion.lastReply.author}
                            </div>
                            <div>{discussion.lastReply.date}</div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  Précédent
                </button>
                <div className="text-sm text-slate-600 dark:text-slate-400">Page 1 sur 12</div>
                <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600">
                  Suivant
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="font-semibold text-slate-900 dark:text-white">Activité récente</h2>
                <Link
                  href="/forum/activity"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                >
                  Voir tout
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <img
                      src="/placeholder.svg?height=40&width=40"
                      alt="Prof. Bernard"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-slate-900 dark:text-white">Prof. Bernard</span>{" "}
                        <span className="text-slate-600 dark:text-slate-400">
                          a répondu à la discussion{" "}
                          <Link
                            href="/forum/discussion/1"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Comment résoudre les équations différentielles du second ordre ?
                          </Link>
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Il y a 30 minutes</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src="/placeholder.svg?height=40&width=40"
                      alt="Sophie Martin"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-slate-900 dark:text-white">Sophie Martin</span>{" "}
                        <span className="text-slate-600 dark:text-slate-400">
                          a créé une nouvelle discussion{" "}
                          <Link
                            href="/forum/discussion/8"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Conseils pour la préparation aux examens de langues
                          </Link>
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Il y a 2 heures</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src="/placeholder.svg?height=40&width=40"
                      alt="Lucas Moreau"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-slate-900 dark:text-white">Lucas Moreau</span>{" "}
                        <span className="text-slate-600 dark:text-slate-400">
                          a aimé la discussion{" "}
                          <Link
                            href="/forum/discussion/3"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Ressources pour apprendre le développement web
                          </Link>
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Il y a 3 heures</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex justify-between shadow-lg">
        <NavButton icon={<Home className="h-6 w-6" />} label="Accueil" href="/home" />
        <NavButton icon={<BookOpen className="h-6 w-6" />} label="Cours" href="/courses" />
        <NavButton icon={<ListTodo className="h-6 w-6" />} label="Tâches" href="/tasks" />
        <NavButton icon={<MessagesSquare className="h-6 w-6" />} label="Messages" href="/messages" />
        <NavButton icon={<MessageCircle className="h-6 w-6" />} label="Forum" href="/forum" isActive />
      </nav>
    </div>
  )
}

// Component for Navigation Item
function NavItem({ icon, label, isActive = false, badge, href = "#" }: { icon: React.ReactNode; label: string; isActive?: boolean; badge?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center px-1 sm:px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
        isActive
          ? "text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800"
          : "text-slate-500 dark:text-slate-400"
      }`}
    >
      <div className="relative">
        {icon}
        {badge && (
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center shadow-sm">
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
        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"
      }`}
    >
      <div className="relative">
        {icon}
        {badge && (
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center shadow-sm">
            {badge}
          </div>
        )}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </Link>
  )
}
