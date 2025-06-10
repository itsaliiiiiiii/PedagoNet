'use client'

import { BookOpen, Users,User, Calendar, Plus, Search } from 'lucide-react'
import Link from "next/link"
import DesktopNav from "@/components/navs/desktopnav"
import { useEffect,useState } from 'react';




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
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-yellow-800', // brun
      'bg-red-500'
    ];
  
    // Convertir l’ID en string et sommer les codes caractères
    const hash = String(id)
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
    // Sélectionner une couleur de manière déterministe
    return colors[hash % colors.length];
  }
  
  


export default function ClassroomPage() {

    const [classrooms, setClassrooms] = useState([]);


    useEffect(()=>{
        async function fetchClassrooms(){
            const response = await fetch(`http://localhost:8080/classrooms`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include'
              });
        
              if (!response.ok) {
                throw new Error('Failed to fetch posts');
              }
        
              const data = await response.json();
        
              if (!data.success) {
                throw new Error(data.message || 'Failed to fetch posts');
              }
        
            //   console.log(data);
            const mapped  = data.classrooms.map((classe: any) => {
                // const isProfessor = classe.author.role === "professor";
                const  isProfessor = true;
                // const isStudent = classe.author.role === "student";
                const isStudent = false;
        
                return {
                  id: classe.id_classroom,
                  avatar: <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
                  avatarBg: isProfessor
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : isStudent
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-gray-100 dark:bg-gray-700",
                  name: `${classe.name}`,
                  color: getColorFromId(classe.id_classroom), // ✅ couleur déterministe

                //   title: isProfessor
                //     ? `Professeur de ${apiPost.author.department || "non spécifié"}`
                //     : isStudent
                //       ? `Étudiant en ${apiPost.author.major || "non spécifié"}`
                //       : "Membre",
                //   time: formatTimeAgo(apiPost.createdAt),
                //   content: apiPost.content,
                //   likes: apiPost.likes || 0,
                description : `${classe.description}`
                //   comments: apiPost.comments || 0,
                //   image: apiPost.imageUrl || undefined,
                //   imageAlt: apiPost.imageAlt || undefined,
                //   isLiked: apiPost.isLiked || false
                };
              }
            );
            setClassrooms(mapped); 
        }
        fetchClassrooms();
    })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation principale */}
      <DesktopNav />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Classrooms</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gérez vos cours et suivez votre progression académique
            </p>
          </div>
          <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Rejoindre un cours
          </button>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">{classroom.teacher}</p>
              </div>

              {/* Card Content */}
              <div className="px-6 pb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{classroom.description}</p>
                <div className="flex gap-2">
                  <Link
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
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Rejoindre votre premier cours
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
