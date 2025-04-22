import React from "react";
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

interface PostProps {
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
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-12 w-12 rounded-full ${avatarBg} flex items-center justify-center shrink-0`}>
            {avatar}
          </div>
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
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-sm ${
            isLiked ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-300"
          } hover:bg-gray-100 dark:hover:bg-gray-700`}
          aria-label={isLiked ? "Retirer le j'aime" : "Aimer le post"}
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span>J'aime</span>
        </button>
        <button
          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Commenter le post"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Commenter</span>
        </button>
        <button
          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Partager le post"
        >
          <Share2 className="h-4 w-4" />
          <span>Partager</span>
        </button>
      </div>
    </div>
  );
};

export default Post;