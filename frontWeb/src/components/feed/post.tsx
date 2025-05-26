"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Lock,
  Users,
  Globe,
  Heart,
  Play,
  Download,
  ExternalLink,
} from "lucide-react"

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
  postId: string // Added postId prop
  avatar: React.ReactNode
  avatarBg?: string
  name: string
  title: string
  time: string
  content: string
  images?: string[]
  video?: {
    url: string
    thumbnail?: string
  }
  document?: {
    url: string
    name: string
    type: string
    size: number
  }
  image?: string
  imageAlt?: string
  likes: number
  comments: number
  isLiked?: boolean
  commentsList?: CommentType[]
  visibility?: "public" | "friends" | "private"
}

const Post: React.FC<PostProps> = ({
  postId, // Added postId
  avatar,
  avatarBg = "",
  name,
  title,
  time,
  content,
  images,
  video,
  document,
  image,
  imageAlt = "Image du post",
  likes,
  comments,
  isLiked = false,
  commentsList = [],
  visibility = "public",
}) => {
  const [showComments, setShowComments] = useState(false)
  const [visibleComments, setVisibleComments] = useState(3)
  const [newComment, setNewComment] = useState("")
  const [focusedInput, setFocusedInput] = useState(false)
  const commentSectionRef = useRef<HTMLDivElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(likes)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [commentsData, setCommentsData] = useState<CommentType[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [commentsFetched, setCommentsFetched] = useState(false)

  const imagesArray = images || (image ? [image] : undefined)

  // Determine media type
  const mediaType = imagesArray ? "images" : video ? "video" : document ? "document" : null

  // Fetch comments from API when comments section is opened
  useEffect(() => {
    if (showComments && !commentsFetched && postId) {
      setCommentsLoading(true)
      setCommentsError(null)
      fetch(`http://localhost:8080/comments/post/${postId}?limit=${visibleComments}&skip=0`, {
        credentials: "include",
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Erreur lors du chargement des commentaires")
          const json = await res.json()
          if (json.success && Array.isArray(json.data)) {
            setCommentsData(
              json.data.map((c: any) => ({
                id: c._id,
                name: `${c.user.lastName} ${c.user.firstName}`,
                avatar: c.user.profilePhoto ? (
                  <img
                    src={`http://localhost:8080/uploads/${c.user.profilePhoto}`}
                    alt="avatar"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  `${c.user.firstName[0] || ""}${c.user.lastName[0] || ""}`
                ),
                avatarBg: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20",
                content: c.content,
                time: new Date(c.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }),
                likes: Array.isArray(c.likes) ? c.likes.length : 0,
              }))
            );
            setCommentsFetched(true)
          } else {
            setCommentsError("Aucun commentaire trouvé.")
          }
        })
        .catch(() => setCommentsError("Erreur lors du chargement des commentaires"))
        .finally(() => setCommentsLoading(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments, postId])

  // Remove defaultComments and only use API/provided comments
  const allComments =
    commentsFetched && commentsData.length > 0
      ? commentsData
      : commentsList.length > 0
        ? commentsList
        : []
  const displayedComments = allComments.slice(0, visibleComments)
  const hasMoreComments = visibleComments < allComments.length

  const handleShowMoreComments = () => {
    setVisibleComments((prev) => Math.min(prev + 3, allComments.length))
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !postId) return

    try {
      const res = await fetch(`http://localhost:8080/comments/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: newComment }),
      })
      const json = await res.json()
      if (res.ok && json.success && json.data) {
        setNewComment("")
        // Optimistically add the new comment to the top of the list
        setCommentsData((prev) => [
          {
            id: json.data._id,
            name: `${json.data.user.lastName} ${json.data.user.firstName}`,
            avatar: json.data.user.profilePhoto ? (
              <img
                src={`http://localhost:8080/uploads/${json.data.user.profilePhoto}`}
                alt="avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              `${json.data.user.firstName[0] || ""}${json.data.user.lastName[0] || ""}`
            ),
            avatarBg: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20",
            content: json.data.content,
            time: new Date(json.data.createdAt).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            }),
            likes: Array.isArray(json.data.likes) ? json.data.likes.length : 0,
          },
          ...commentsData,
        ])
        setCommentsFetched(true)
        setShowComments(true)
      } else {
        // Optionally handle error feedback
      }
    } catch (err) {
      // Optionally handle error feedback
    }
  }
  const nextImage = () => {
    if (imagesArray && imagesArray.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % imagesArray.length)
    }
  }

  const prevImage = () => {
    if (imagesArray && imagesArray.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? imagesArray.length - 1 : prev - 1))
    }
  }

  // Handle video play/pause
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB"
    else return (bytes / 1073741824).toFixed(1) + " GB"
  }

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("doc")) return "📝"
    if (fileType.includes("xls")) return "📊"
    if (fileType.includes("ppt")) return "📑"
    if (fileType.includes("zip") || fileType.includes("rar")) return "🗜️"
    return "📁"
  }

  // Get visibility text and icon
  const getVisibilityInfo = () => {
    switch (visibility) {
      case "friends":
        return { text: "Visible par les amis", icon: <Users className="h-3 w-3 text-blue-500" /> }
      case "private":
        return { text: "Visible uniquement par vous", icon: <Lock className="h-3 w-3 text-purple-500" /> }
      default:
        return { text: "Visible par tous", icon: <Globe className="h-3 w-3 text-green-500" /> }
    }
  }

  const visibilityInfo = getVisibilityInfo()

  // Handle like functionality with real API call
  const handleLike = async () => {
    if (isLikeLoading || !postId) return

    setIsLikeLoading(true)

    try {
      const response = await fetch(`http://localhost:8080/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        // Only update UI if API call was successful
        setLiked(!liked)
        setLikeCount((prev) => prev + (liked ? -1 : 1))
      } else {
        // Handle API error
        console.error("API Error:", "Failed to update like status")
      }
    } catch (error) {
      console.error("Error liking post:", error)
    } finally {
      setIsLikeLoading(false)
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
  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement) {
      const handlePlay = () => setIsVideoPlaying(true)
      const handlePause = () => setIsVideoPlaying(false)
      const handleEnded = () => setIsVideoPlaying(false)

      videoElement.addEventListener("play", handlePlay)
      videoElement.addEventListener("pause", handlePause)
      videoElement.addEventListener("ended", handleEnded)

      return () => {
        videoElement.removeEventListener("play", handlePlay)
        videoElement.removeEventListener("pause", handlePause)
        videoElement.removeEventListener("ended", handleEnded)
      }
    }
  }, [])

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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  {time} •
                  <span
                    className={`${
                      visibility === "friends"
                        ? "text-blue-500 dark:text-blue-400"
                        : visibility === "private"
                          ? "text-purple-500 dark:text-purple-400"
                          : "text-green-500 dark:text-green-400"
                    }`}
                  >
                    {visibility === "friends" ? (
                      <Users className="h-3.5 w-3.5" />
                    ) : visibility === "private" ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <Globe className="h-3.5 w-3.5" />
                    )}
                  </span>
                </p>
              </div>
              <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1.5 transition-colors duration-200">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3.5">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{content}</p>
            </div>
            {mediaType && (
              <div className="mt-4">
                {/* Multiple images */}
                {mediaType === "images" && imagesArray && (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
                    <img
                      src={imagesArray[currentImageIndex] || "/default-placeholder.png"}
                      alt={`${imageAlt} ${currentImageIndex + 1}`}
                      className="w-full h-auto object-contain max-h-[500px]"
                    />

                    {/* Image navigation for multiple images */}
                    {imagesArray.length > 1 && (
                      <>
                        {/* Navigation buttons */}
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
                          aria-label="Image précédente"
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
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
                          aria-label="Image suivante"
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
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>

                        {/* Image counter */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                          {currentImageIndex + 1} / {imagesArray.length}
                        </div>

                        {/* Image thumbnails */}
                        {imagesArray.length > 1 && (
                          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 p-2 bg-gradient-to-t from-black/50 to-transparent">
                            {imagesArray.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-200 ${
                                  idx === currentImageIndex ? "w-6 bg-white" : "w-3 bg-white/60 hover:bg-white/80"
                                }`}
                                aria-label={`Aller à l'image ${idx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Video */}
                {mediaType === "video" && video && (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
                    {!isVideoPlaying && video.thumbnail && (
                      <div className="absolute inset-0 bg-black">
                        <img
                          src={video.thumbnail || "/placeholder.svg"}
                          alt="Miniature vidéo"
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                    )}

                    <video
                      ref={videoRef}
                      src={video.url}
                      className="w-full max-h-[500px]"
                      controls={isVideoPlaying}
                      poster={video.thumbnail}
                    />

                    {!isVideoPlaying && (
                      <button
                        onClick={toggleVideo}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all duration-200 group"
                        aria-label="Lire la vidéo"
                      >
                        <div className="h-16 w-16 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center backdrop-blur-sm transition-all duration-200 group-hover:scale-110">
                          <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {/* Document */}
                {mediaType === "document" && document && (
                  <div className="rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-2xl shadow-sm border border-gray-200 dark:border-gray-600">
                        {getFileIcon(document.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">{document.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {document.type.split("/")[1]?.toUpperCase() || document.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(document.size)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={document.url}
                          download={document.name}
                          className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors duration-200"
                          aria-label="Télécharger"
                        >
                          <Download className="h-5 w-5" />
                        </a>
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                          aria-label="Ouvrir"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {(likeCount > 0 || comments > 0) && (
          <div className="mt-4 pt-1 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-full p-1 shadow-sm">
                <ThumbsUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span>{likeCount}</span>
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
            liked ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-300"
          } hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
            isLikeLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          aria-label={liked ? "Retirer le j'aime" : "Aimer le post"}
          onClick={handleLike}
          disabled={isLikeLoading}
        >
          {isLikeLoading ? (
            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          )}
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
            {commentsLoading && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">Chargement des commentaires...</div>
            )}
            {commentsError && (
              <div className="text-center text-red-500 dark:text-red-400 py-4">{commentsError}</div>
            )}
            {!commentsLoading && !commentsError && displayedComments.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">Aucun commentaire</div>
            )}
            {!commentsLoading && !commentsError && displayedComments.map((comment, index) => (
              <div
                key={comment.id || index}
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
            {!commentsLoading && !commentsError && hasMoreComments && (
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
