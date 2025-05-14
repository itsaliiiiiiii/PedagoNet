const Comment = require('../models/comment.model');

class CommentRepository {
    async createComment(userId, postId, content, parentCommentId = null) {
        try {
            const comment = new Comment({
                content,
                userId,
                postId,
                parentCommentId
            });
            await comment.save();
            return comment;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    }

    async getPostComments(postId, limit = 10, skip = 0) {
        try {
            const comments = await Comment.find({ postId, parentCommentId: null })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'firstName lastName profilePhoto')
                .populate({
                    path: 'replies',
                    populate: {
                        path: 'userId',
                        select: 'firstName lastName profilePhoto'
                    }
                });

            return comments;
        } catch (error) {
            console.error('Error getting post comments:', error);
            throw error;
        }
    }

    async getCommentReplies(commentId, limit = 10, skip = 0) {
        try {
            const comment = await Comment.findById(commentId)
                .populate({
                    path: 'replies',
                    populate: {
                        path: 'userId',
                        select: 'firstName lastName profilePhoto'
                    }
                });

            if (!comment) {
                throw new Error('Comment not found');
            }

            const replies = comment.replies
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(skip, skip + limit);

            return replies;
        } catch (error) {
            console.error('Error getting comment replies:', error);
            throw error;
        }
    }

    async updateComment(commentId, userId, content) {
        try {
            const comment = await Comment.findOneAndUpdate(
                { _id: commentId, userId },
                { content },
                { new: true }
            ).populate('userId', 'firstName lastName profilePhoto');

            if (!comment) {
                throw new Error('Comment not found or not authorized');
            }

            return comment;
        } catch (error) {
            console.error('Error updating comment:', error);
            throw error;
        }
    }

    async deleteComment(commentId, userId) {
        try {
            const result = await Comment.deleteOne({ _id: commentId, userId });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }

    async addReply(commentId, userId, content) {
        try {
            const comment = await Comment.findById(commentId);
            if (!comment) {
                throw new Error('Comment not found');
            }

            comment.replies.push({
                userId,
                content
            });

            await comment.save();
            return comment.replies[comment.replies.length - 1];
        } catch (error) {
            console.error('Error adding reply:', error);
            throw error;
        }
    }

    async toggleLike(commentId, userId, isReply = false, replyId = null) {
        try {
            const comment = await Comment.findById(commentId);
            if (!comment) {
                throw new Error('Comment not found');
            }

            if (isReply) {
                const reply = comment.replies.id(replyId);
                if (!reply) {
                    throw new Error('Reply not found');
                }

                const likeIndex = reply.likes.indexOf(userId);
                if (likeIndex === -1) {
                    reply.likes.push(userId);
                } else {
                    reply.likes.splice(likeIndex, 1);
                }
            } else {
                const likeIndex = comment.likes.indexOf(userId);
                if (likeIndex === -1) {
                    comment.likes.push(userId);
                } else {
                    comment.likes.splice(likeIndex, 1);
                }
            }

            await comment.save();
            return true;
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    }
}

module.exports = new CommentRepository();