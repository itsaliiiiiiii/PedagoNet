import Link from "next/link"
import {
  Bell,
  BookOpen,
  Bookmark,
  ChevronDown,
  Grid,
  Home,
  ImageIcon,
  MessagesSquare,
  MoreHorizontal,
  Paperclip,
  Search,
  Share2,
  ThumbsUp,
  User,
  Users,
  Video,
  Calendar,
  MessageCircle,
} from "lucide-react"
import Logo from "@/components/logo"

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* LinkedIn-like Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  aria-label="Rechercher dans SchoolConnect"
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Navigation - Hidden on mobile */}
            <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
              <NavItem icon={<Home />} label="Accueil" isActive />
              <NavItem icon={<Users />} label="Réseau" />
              <NavItem icon={<MessagesSquare />} label="Messages" />
              <NavItem icon={<Bell />} label="Notifications" />
              <div className="flex items-center pl-5 border-l border-gray-300 dark:border-gray-600">
                <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600 dark:text-gray-300" />
                </div>
                <div className="hidden sm:flex items-center text-xs text-gray-700 dark:text-gray-300">
                  <span className="mx-1">Moi</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left Sidebar - Profile */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-20">
              {/* Profile Background */}
              <div className="h-14 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700"></div>

              {/* Profile Info */}
              <div className="px-4 pt-4 pb-2 text-center border-b border-gray-200 dark:border-gray-700">
                <div className="h-16 w-16 mx-auto -mt-12 rounded-full border-2 border-white dark:border-gray-800 bg-blue-100 dark:bg-gray-700 flex items-center justify-center shadow-sm">
                  <User className="h-8 w-8 text-blue-600 dark:text-gray-300" />
                </div>
                <Link
                  href="/profile"
                  className="mt-2 text-lg font-medium text-gray-900 dark:text-white hover:underline"
                >
                  Jean Dupont
                </Link>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Élève en Terminale S • Lycée Victor Hugo
                </p>
              </div>

              {/* Profile Stats */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Vues du profil</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">32</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Apparitions dans la recherche</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">12</span>
                </div>
              </div>

              {/* Saved Items */}
              <div className="px-4 py-3">
                <Link
                  href="/bookmarks"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Éléments sauvegardés</span>
                </Link>
              </div>
            </div>

            {/* Recent Tags */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-4">
              <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-3">Centres d'intérêt récents</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                    #mathématiques
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                    #sciences
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                    #clubthéâtre
                  </span>
                </div>
              </div>
              <Link
                href="/tags"
                className="block mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Voir tous les centres d'intérêt
              </Link>
            </div>
          </aside>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Create Post - Responsive */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-blue-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 space-y-3">
                  <button className="w-full text-left px-4 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Démarrer un post...
                  </button>
                  <div className="flex flex-wrap justify-between gap-2">
                    <button className="flex items-center gap-1 px-2 py-1 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <ImageIcon className="h-5 w-5 text-blue-500" />
                      <span>Photo</span>
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Video className="h-5 w-5 text-green-500" />
                      <span>Vidéo</span>
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <span>Événement</span>
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Paperclip className="h-5 w-5 text-purple-500" />
                      <span>Document</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* LinkedIn-style Posts */}
            {/* Post 1 - Teacher */}
            <Post
              avatar={<User className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
              avatarBg="bg-purple-100 dark:bg-purple-900/30"
              name="Mme. Martin"
              title="Professeur de Mathématiques"
              time="2h"
              content="Rappel important: Le devoir de mathématiques prévu pour demain est reporté à vendredi. N'oubliez pas de réviser les chapitres 5 et 6. Vous pouvez me poser vos questions en commentaire."
              likes={24}
              comments={8}
              imageAlt={undefined}
              image={undefined}
            />

            {/* Post 2 - Event */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Club de Théâtre</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Événement • Demain à 16h</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="text-blue-600 dark:text-blue-400">32 participants</span>
                        </p>
                      </div>
                      <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-3">
                      <h2 className="text-base font-medium text-gray-900 dark:text-white">
                        Répétition pour la pièce de fin d'année
                      </h2>
                      <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                        Tous les membres du club de théâtre sont invités à la répétition de demain. Nous finaliserons
                        les costumes et les derniers détails de mise en scène.
                      </p>
                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Mardi 15 Juin</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">16h00 - 18h00</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-3">
                          <div className="flex items-center gap-2">
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
                              className="text-gray-600 dark:text-gray-300"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Salle de spectacle</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">Bâtiment principal</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 py-2 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ThumbsUp className="h-4 w-4" />
                  <span>J'aime</span>
                </button>
                <button className="flex-1 py-2 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MessageCircle className="h-4 w-4" />
                  <span>Commenter</span>
                </button>
                <button className="flex-1 py-2 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Share2 className="h-4 w-4" />
                  <span>Partager</span>
                </button>
              </div>
            </div>

            {/* Post 3 - Student with Photo */}
            <Post
              avatar={<User className="h-6 w-6 text-blue-600 dark:text-gray-300" />}
              avatarBg="bg-blue-100 dark:bg-gray-700"
              name="Thomas Lefebvre"
              title="Élève - Terminale S"
              time="5h"
              content="Notre projet de sciences a remporté le premier prix au concours régional! Merci à toute l'équipe et à M. Bernard pour son aide précieuse. 🏆"
              image="/placeholder.svg?height=300&width=600"
              imageAlt="Photo de l'équipe avec le trophée"
              likes={42}
              comments={15}
              isLiked={true}
            />

            {/* Post 4 - Group Announcement */}
            <Post
              avatar={<BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />}
              avatarBg="bg-green-100 dark:bg-green-900/30"
              name="Club Sciences"
              title="Groupe • 324 membres"
              time="1 jour"
              content="Nous organisons une conférence sur l'intelligence artificielle le mois prochain. Des experts du domaine viendront présenter les dernières avancées. Inscrivez-vous dès maintenant pour réserver votre place! Places limitées. #scienceclub #IA"
              likes={16}
              imageAlt={undefined}
              image={undefined}
              comments={3}
            />
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

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 flex justify-between">
        <NavButton icon={<Home />} label="Accueil" isActive />
        <NavButton icon={<Users />} label="Réseau" />
        <NavButton icon={<MessagesSquare />} label="Messages" />
        <NavButton icon={<Bell />} label="Notifications" />
        <NavButton icon={<User />} label="Profil" />
      </nav>
    </div>
  )
}

// Component for Navigation Item
function NavItem({ icon, label, isActive = false }: { icon: React.ReactNode; label: string; isActive?: boolean }) {
  return (
    <button
      className={`flex flex-col items-center justify-center px-1 sm:px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? "text-black dark:text-white border-b-2 border-black dark:border-white" : "text-gray-500 dark:text-gray-400"}`}
    >
      <div className="relative">{icon}</div>
      <span className="hidden sm:block text-xs mt-0.5">{label}</span>
    </button>
  )
}

// Component for Mobile Navigation Button
function NavButton({ icon, label, isActive = false }: { icon: React.ReactNode; label: string; isActive?: boolean }) {
  return (
    <button
      className={`flex flex-col items-center justify-center ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  )
}

// LinkedIn-style Post Component
function Post({
  avatar,
  avatarBg = "",
  name,
  title,
  time,
  content,
  image,
  imageAlt = "Image du post",
  likes,
  comments,
  isLiked = false,
}: {
  avatar: React.ReactNode;
  avatarBg?: string;
  name: string;
  title: string;
  time: string;
  content: string;
  image?: string;
  imageAlt?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-12 w-12 rounded-full ${avatarBg} flex items-center justify-center shrink-0`}>{avatar}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {time} • <span className="text-blue-600 dark:text-blue-400">Visible par tous</span>
                </p>
              </div>
              <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-800 dark:text-gray-200">{content}</p>
            </div>
            {image && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={image || "/default-placeholder.png"}
                  alt={imageAlt}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Likes and Comments Count */}
        {(likes > 0 || comments > 0) && (
          <div className="mt-3 pt-1 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-1">
                <ThumbsUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span>{likes}</span>
            </div>
            {comments > 0 && <button className="hover:underline">{comments} commentaires</button>}
          </div>
        )}
      </div>
      <div className="flex border-t border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-sm ${isLiked ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-300"} hover:bg-gray-100 dark:hover:bg-gray-700`}
          aria-label={isLiked ? "Retirer le j'aime" : "Aimer le post"}
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span>J'aime</span>
        </button>
        <button className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Commenter le post">
          <MessageCircle className="h-4 w-4" />
          <span>Commenter</span>
        </button>
        <button className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Partager le post">
          <Share2 className="h-4 w-4" />
          <span>Partager</span>
        </button>
      </div>
    </div>
  )
}