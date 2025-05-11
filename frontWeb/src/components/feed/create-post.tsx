"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { User, ImageIcon, Video, Paperclip, X, Globe, Users, Lock, AlertCircle, Trash2 } from "lucide-react"

type VisibilityOption = {
  id: string
  label: string
  icon: React.ReactNode
  description: string
}

type MediaType = "images" | "videos" | "documents" | null

export default function CreatePost() {
  const [postContent, setPostContent] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedVideos, setSelectedVideos] = useState<File[]>([])
  const [selectedDocs, setSelectedDocs] = useState<File[]>([])
  const [activeMediaType, setActiveMediaType] = useState<MediaType>(null)
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const [selectedVisibility, setSelectedVisibility] = useState<VisibilityOption>(visibilityOptions[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const visibilityRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (visibilityRef.current && !visibilityRef.current.contains(e.target as Node)) {
      setVisibilityOpen(false)
    }
  }

  // Add event listener for outside clicks
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Reset success message after 3 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [submitSuccess])

  // Update activeMediaType when media selections change
  useEffect(() => {
    if (selectedImages.length > 0) {
      setActiveMediaType("images")
    } else if (selectedVideos.length > 0) {
      setActiveMediaType("videos")
    } else if (selectedDocs.length > 0) {
      setActiveMediaType("documents")
    } else {
      setActiveMediaType(null)
    }
  }, [selectedImages, selectedVideos, selectedDocs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Only include the active media type in the form data
      let attachments: File[] = []
      if (activeMediaType === "images") {
        attachments = selectedImages
      } else if (activeMediaType === "videos") {
        attachments = selectedVideos
      } else if (activeMediaType === "documents") {
        attachments = selectedDocs
      }

      const formData = new FormData()
      formData.append("content", postContent)
      formData.append("visibility", selectedVisibility.id)
      formData.append("mediaType", activeMediaType || "none")

      attachments.forEach((file) => {
        formData.append("attachments", file)
      })

      const response = await fetch("http://localhost:8080/posts", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create post")
      }

      // Reset form
      setPostContent("")
      setSelectedImages([])
      setSelectedVideos([])
      setSelectedDocs([])
      setActiveMediaType(null)
      setSubmitSuccess(true)

      console.log("Post created successfully:", data.post)
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the post")
      console.error("Error creating post:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Clear other media types first
      setSelectedVideos([])
      setSelectedDocs([])
      setSelectedImages(Array.from(e.target.files || []))
      setActiveMediaType("images")
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Clear other media types first
      setSelectedImages([])
      setSelectedDocs([])
      setSelectedVideos(Array.from(e.target.files || []))
      setActiveMediaType("videos")
    }
  }

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Clear other media types first
      setSelectedImages([])
      setSelectedVideos([])
      setSelectedDocs(Array.from(e.target.files || []))
      setActiveMediaType("documents")
    }
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    if (newImages.length === 0) {
      setActiveMediaType(null)
    }
  }

  const removeVideo = (index: number) => {
    const newVideos = selectedVideos.filter((_, i) => i !== index)
    setSelectedVideos(newVideos)
    if (newVideos.length === 0) {
      setActiveMediaType(null)
    }
  }

  const removeDoc = (index: number) => {
    const newDocs = selectedDocs.filter((_, i) => i !== index)
    setSelectedDocs(newDocs)
    if (newDocs.length === 0) {
      setActiveMediaType(null)
    }
  }

  const clearAllMedia = () => {
    setSelectedImages([])
    setSelectedVideos([])
    setSelectedDocs([])
    setActiveMediaType(null)
  }

  const hasAttachments = selectedImages.length > 0 || selectedVideos.length > 0 || selectedDocs.length > 0
  const canSubmit = (postContent.trim() !== "" || hasAttachments) && !isSubmitting

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-blue-600 dark:text-gray-300" />
          </div>
          <div className="flex-1 space-y-3">
            {/* Success message */}
            {submitSuccess && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p>Post créé avec succès!</p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Démarrer un post..."
                className="w-full min-h-[80px] px-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Prévisualisation des images */}
            {selectedImages.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Images jointes</h4>
                  <button
                    type="button"
                    onClick={clearAllMedia}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Tout effacer
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={`img-${index}`} className="relative group">
                      <div className="h-20 w-20 rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
                        <img
                          src={URL.createObjectURL(image) || "/placeholder.svg"}
                          alt={`Preview ${index}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prévisualisation des vidéos */}
            {selectedVideos.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Vidéos jointes</h4>
                  <button
                    type="button"
                    onClick={clearAllMedia}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Tout effacer
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedVideos.map((video, index) => (
                    <div key={`vid-${index}`} className="relative group">
                      <div className="h-20 w-32 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 truncate max-w-[80px]">
                          {video.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prévisualisation des documents */}
            {selectedDocs.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Documents joints</h4>
                  <button
                    type="button"
                    onClick={clearAllMedia}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Tout effacer
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDocs.map((doc, index) => (
                    <div key={`doc-${index}`} className="relative group">
                      <div className="h-16 w-full max-w-xs rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center p-2">
                        <Paperclip className="h-6 w-6 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{doc.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {(doc.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDoc(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 items-center">
                {/* Boutons pour ajouter des fichiers */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={activeMediaType !== null && activeMediaType !== "images"}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeMediaType === "images"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : activeMediaType === null
                          ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                    <span>Photos</span>
                  </button>

                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoChange}
                    accept="video/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={activeMediaType !== null && activeMediaType !== "videos"}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeMediaType === "videos"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : activeMediaType === null
                          ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <Video className="h-5 w-5 text-green-500" />
                    <span>Vidéos</span>
                  </button>

                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={handleDocChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    disabled={activeMediaType !== null && activeMediaType !== "documents"}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeMediaType === "documents"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : activeMediaType === null
                          ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <Paperclip className="h-5 w-5 text-purple-500" />
                    <span>Documents</span>
                  </button>
                </div>

                {/* Sélecteur de visibilité */}
                <div className="relative" ref={visibilityRef}>
                  <button
                    type="button"
                    onClick={() => setVisibilityOpen(!visibilityOpen)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      {selectedVisibility.icon}
                      <span>{selectedVisibility.label}</span>
                    </span>
                  </button>

                  {visibilityOpen && (
                    <div className="absolute left-0 mt-1 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10 border border-gray-200 dark:border-gray-700">
                      <div className="py-1">
                        {visibilityOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start gap-2"
                            onClick={() => {
                              setSelectedVisibility(option)
                              setVisibilityOpen(false)
                            }}
                          >
                            <div className="flex-shrink-0 mt-0.5">{option.icon}</div>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton de publication */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  canSubmit
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                } transition-colors flex items-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Publication...
                  </>
                ) : (
                  "Publier"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// Visibility options
const visibilityOptions: VisibilityOption[] = [
  {
    id: "public",
    label: "Public",
    icon: <Globe className="h-4 w-4 text-green-500" />,
    description: "Tout le monde peut voir ce post",
  },
  {
    id: "friends",
    label: "Amis",
    icon: <Users className="h-4 w-4 text-blue-500" />,
    description: "Seulement vos amis peuvent voir ce post",
  },
  {
    id: "private",
    label: "Privé",
    icon: <Lock className="h-4 w-4 text-purple-500" />,
    description: "Seulement vous pouvez voir ce post",
  },
]
