const Comment = require('../models/comment.model');

const addComment = async (postId, userId, content) => {
    try {
        const comment = new Comment({
            postId,
            userId,
            content
        });

        await comment.save();
        return {
            success: true,
            comment: await comment.populate('userId', 'firstName lastName profilePhoto')
        };
    } catch (error) {
        console.error('Comment creation error:', error);
        return { success: false, message: 'Failed to add comment' };
    }
};

const getComments = async (postId, limit = 100, skip = 0) => {
    try {
        const comments = await Comment.find({ postId })
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

        return {
            success: true,
            comments
        };
    } catch (error) {
        console.error('Comments retrieval error:', error);
        return { success: false, message: 'Failed to retrieve comments' };
    }
};

const updateComment = async (commentId, userId, content) => {
    try {
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, userId },
            { content },
            { new: true }
        ).populate('userId', 'firstName lastName profilePhoto');

        if (!comment) {
            return { success: false, message: 'Comment not found or not authorized' };
        }

        return {
            success: true,
            comment
        };
    } catch (error) {
        console.error('Comment update error:', error);
        return { success: false, message: 'Failed to update comment' };
    }
};

const deleteComment = async (commentId, userId) => {
    try {
        const result = await Comment.deleteOne({ _id: commentId, userId });
        return {
            success: result.deletedCount > 0,
            message: result.deletedCount > 0 ? 'Comment deleted successfully' : 'Comment not found or not authorized'
        };
    } catch (error) {
        console.error('Comment deletion error:', error);
        return { success: false, message: 'Failed to delete comment' };
    }
};

const addReply = async (commentId, userId, content) => {
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return { success: false, message: 'Comment not found' };
        }

        comment.replies.push({
            userId,
            content
        });

        await comment.save();
        const populatedComment = await comment.populate({
            path: 'replies',
            populate: {
                path: 'userId',
                select: 'firstName lastName profilePhoto'
            }
        });

        return {
            success: true,
            reply: populatedComment.replies[populatedComment.replies.length - 1]
        };
    } catch (error) {
        console.error('Reply creation error:', error);
        return { success: false, message: 'Failed to add reply' };
    }
};

const getReplies = async (commentId, limit = 10, skip = 0) => {
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
            return { success: false, message: 'Comment not found' };
        }

        const replies = comment.replies
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(skip, skip + limit);

        return {
            success: true,
            replies
        };
    } catch (error) {
        console.error('Replies retrieval error:', error);
        return { success: false, message: 'Failed to retrieve replies' };
    }
};

const toggleLike = async (commentId, userId, isReply = false, replyId = null) => {
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return { success: false, message: 'Comment not found' };
        }

        if (isReply) {
            const reply = comment.replies.id(replyId);
            if (!reply) {
                return { success: false, message: 'Reply not found' };
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
        return {
            success: true,
            message: 'Like toggled successfully'
        };
    } catch (error) {
        console.error('Like toggle error:', error);
        return { success: false, message: 'Failed to toggle like' };
    }
};

module.exports = {
    addComment,
    getComments,
    updateComment,
    deleteComment,
    addReply,
    getReplies,
    toggleLike
};