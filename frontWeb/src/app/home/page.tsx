import Link from "next/link"
import {
  ImageIcon,
  Paperclip,
  User,
  Video,
  Calendar,

} from "lucide-react"
import Post from "@/components/feed/post"
import DesktopNav from "@/components/navs/desktopnav"
import MobileNav from "@/components/navs/mobilenav"

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      
      <DesktopNav/>
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left Sidebar - Profile */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden top-20">
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
            <Post
              avatar={<Calendar className="h-6 w-6 text-orange-500" />}
              avatarBg="bg-orange-100 dark:bg-orange-900/30"
              name="Lycée Victor Hugo"
              title="Événement à venir"
              time="3 jours"
              content="Ne manquez pas la journée portes ouvertes ce samedi à partir de 10h. Venez découvrir nos installations et rencontrer nos enseignants."
              likes={12}
              comments={4}
              image="/path-to-event-image.jpg" // Replace with the actual image path
              imageAlt="Journée portes ouvertes"
              isLiked={false}
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
      <MobileNav/>
    </div>
  )
}
