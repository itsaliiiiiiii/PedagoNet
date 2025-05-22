"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Send, Heart } from "lucide-react"

interface CommentType {
  id: string
  name: string
  avatar: React.ReactNode | string
  avatarBg?: string
  content: string
  time: string
  likes: number
}

interface PostProps {
  avatar: React.ReactNode
  avatarBg?: string
  name: string
  title: string
  time: string
  content: string
  image?: string
  imageAlt?: string
  likes: number
  comments: number
  isLiked?: boolean
  commentsList?: CommentType[]
}

const Post: React.FC<PostProps> = ({
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
  commentsList = [],
}) => {
  const [showComments, setShowComments] = useState(false)
  const [visibleComments, setVisibleComments] = useState(3)
  const [newComment, setNewComment] = useState("")
  const [focusedInput, setFocusedInput] = useState(false)
  const commentSectionRef = useRef<HTMLDivElement>(null)

  // Default comments if none provided
  const defaultComments: CommentType[] = [
    {
      id: "1",
      name: "Marie Dupont",
      avatar: "MD",
      avatarBg: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/20",
      content: "Super article, merci pour le partage ! J'apprécie vraiment la qualité de ton contenu.",
      time: "Il y a 2h",
      likes: 5,
    },
    {
      id: "2",
      name: "Thomas Martin",
      avatar: "TM",
      avatarBg: "bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/20",
      content: "Je suis tout à fait d'accord avec ton analyse. C'est très pertinent et bien documenté.",
      time: "Il y a 1h",
      likes: 2,
    },
    {
      id: "3",
      name: "Sophie Lefebvre",
      avatar: "SL",
      avatarBg: "bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/40 dark:to-rose-800/20",
      content: "Très intéressant, j'aimerais en savoir plus sur ce sujet. As-tu d'autres ressources à partager ?",
      time: "Il y a 45min",
      likes: 1,
    },
    {
      id: "4",
      name: "Lucas Bernard",
      avatar: "LB",
      avatarBg: "bg-gradient-to-br from-blue-100 to-sky-200 dark:from-blue-900/40 dark:to-sky-800/20",
      content: "Est-ce que tu pourrais partager tes sources ? J'aimerais approfondir certains points.",
      time: "Il y a 30min",
      likes: 0,
    },
    {
      id: "5",
      name: "Emma Petit",
      avatar: "EP",
      avatarBg: "bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-800/20",
      content: "J'ai partagé cet article avec mon équipe, merci ! Nous allons certainement l'utiliser comme référence.",
      time: "Il y a 15min",
      likes: 3,
    },
  ]

  const allComments = commentsList.length > 0 ? commentsList : defaultComments
  const displayedComments = allComments.slice(0, visibleComments)
  const hasMoreComments = visibleComments < allComments.length

  const handleShowMoreComments = () => {
    setVisibleComments((prev) => Math.min(prev + 3, allComments.length))
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      // In a real app, you would add the comment to your database
      // For now, we'll just clear the input
      setNewComment("")
    }
  }

  // Scroll to new comments when they're loaded
  useEffect(() => {
    if (showComments && commentSectionRef.current) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: "smooth",
        block: "start",
      }
      setTimeout(() => {
        commentSectionRef.current?.scrollIntoView(scrollOptions)
      }, 100)
    }
  }, [visibleComments, showComments])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200/80 dark:border-gray-700/80 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`h-12 w-12 rounded-full ${
              avatarBg || "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
            } flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white dark:ring-gray-700`}
          >
            {avatar}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {time} • <span className="text-blue-600 dark:text-blue-400">Visible par tous</span>
                </p>
              </div>
              <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1.5 transition-colors duration-200">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3.5">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{content}</p>
            </div>
            {image && (
              <div className="mt-4 rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
                <img src={image || "/default-placeholder.png"} alt={imageAlt} className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        </div>

        {(likes > 0 || comments > 0) && (
          <div className="mt-4 pt-1 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-full p-1 shadow-sm">
                <ThumbsUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span>{likes}</span>
            </div>
            {comments > 0 && (
              <button
                className="hover:underline transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={toggleComments}
              >
                {comments} commentaires
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex border-t border-gray-200/80 dark:border-gray-700/80">
        <button
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm ${
            isLiked ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-300"
          } hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200`}
          aria-label={isLiked ? "Retirer le j'aime" : "Aimer le post"}
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span>J'aime</span>
        </button>
        <button
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
            showComments ? "bg-gray-50 dark:bg-gray-700/50" : ""
          }`}
          aria-label="Commenter le post"
          onClick={toggleComments}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Commenter</span>
        </button>
        <button
          className="flex-1 py-3 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
          aria-label="Partager le post"
        >
          <Share2 className="h-4 w-4" />
          <span>Partager</span>
        </button>
      </div>

      {showComments && (
        <div
          className="border-t border-gray-200/80 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50 transition-all duration-300"
          ref={commentSectionRef}
        >
          {/* Comment input */}
          <form
            onSubmit={handleSubmitComment}
            className="flex gap-3 p-4 pb-5 border-b border-gray-200/60 dark:border-gray-700/60"
          >
            <div
              className={`h-10 w-10 rounded-full ${
                avatarBg || "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
              } flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white dark:ring-gray-700`}
            >
              {typeof avatar === "string" ? avatar : "You"}
            </div>
            <div className="flex-1 relative">
              <div
                className={`rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
                  focusedInput ? "ring-2 ring-blue-300 dark:ring-blue-700" : ""
                }`}
              >
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onFocus={() => setFocusedInput(true)}
                  onBlur={() => setFocusedInput(false)}
                  placeholder="Écrivez un commentaire..."
                  className="w-full bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none transition-all duration-200 border-0"
                />
              </div>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  newComment.trim()
                    ? "text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    : "text-gray-400 dark:text-gray-500"
                } p-1.5 rounded-full transition-all duration-200`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Comments list */}
          <div className="px-4 py-3 space-y-4">
            {displayedComments.map((comment, index) => (
              <div
                key={comment.id}
                className="group animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-3">
                  <div
                    className={`h-10 w-10 rounded-full ${
                      comment.avatarBg || "bg-gray-200 dark:bg-gray-700"
                    } flex items-center justify-center shrink-0 text-xs font-medium shadow-sm ring-2 ring-white dark:ring-gray-700`}
                  >
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3 shadow-sm hover:shadow transition-all duration-300">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{comment.name}</div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                      {comment.likes > 0 && (
                        <div className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-full py-0.5 px-2 shadow-sm border border-gray-100 dark:border-gray-700">
                          <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                          <span>{comment.likes}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-1 text-xs">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">{comment.time}</span>
                      <button className="font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                        J'aime
                      </button>
                      <button className="font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                        Répondre
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Show more button */}
            {hasMoreComments && (
              <div className="pt-2 pb-3 flex justify-center">
                <button
                  onClick={handleShowMoreComments}
                  className="px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200 shadow-sm border border-gray-100 dark:border-gray-600 flex items-center gap-2"
                >
                  <span>Afficher plus de commentaires</span>
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
                    className="animate-bounce"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default Post
