const Comment = require('../models/comment.model');
const BaseRepository = require('../repositories/base.repository');
const baseRepo = new BaseRepository();

const createComment = async (userId, postId, content, parentCommentId = null) => {
    try {
        // Find or create the document for this post's comments
        let commentDoc = await Comment.findOne({ postId });
        if (!commentDoc) {
            commentDoc = new Comment({
                postId,
                comments: []
            });
        }

        // Get user info from Neo4j
        const userQuery = `
            MATCH (u:User {id_user: $userId})
            RETURN u
        `;
        const userResult = await baseRepo.executeQuery(userQuery, { userId });
        const userInfo = userResult[0]?.get('u').properties;

        if (!userInfo) {
            return { success: false, message: 'User not found' };
        }

        if (parentCommentId) {
            const parentCommentIndex = commentDoc.comments.findIndex(
                comment => comment._id.toString() === parentCommentId
            );

            if (parentCommentIndex === -1) {
                return { success: false, message: 'Parent comment not found' };
            }

            const reply = {
                userId,
                content,
                createdAt: new Date(),
                updatedAt: new Date(),
                likes: []
            };

            commentDoc.comments[parentCommentIndex].replies.push(reply);
            await commentDoc.save();

            return {
                success: true,
                data: {
                    ...reply,
                    user: {
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        profilePhoto: userInfo.profilePhoto
                    }
                }
            };
        } else {
            const newComment = {
                userId,
                content,
                createdAt: new Date(),
                updatedAt: new Date(),
                likes: [],
                replies: []
            };

            commentDoc.comments.push(newComment);
            await commentDoc.save();

            return {
                success: true,
                data: {
                    ...newComment,
                    user: {
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        profilePhoto: userInfo.profilePhoto
                    }
                }
            };
        }
    } catch (error) {
        console.error('Comment creation error:', error);
        return { success: false, message: 'Failed to create comment' };
    }
};

const getPostComments = async (postId, limit = 10, skip = 0) => {
    try {
        const commentDoc = await Comment.findOne({ postId })
            .populate('comments.userId', 'firstName lastName profilePhoto')
            .populate('comments.replies.userId', 'firstName lastName profilePhoto');

        if (!commentDoc) {
            return { success: true, data: [] };
        }

        const comments = commentDoc.comments
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(skip, skip + limit);

        return { success: true, data: comments };
    } catch (error) {
        console.error('Comments retrieval error:', error);
        return { success: false, message: 'Failed to retrieve comments' };
    }
};

// Export other necessary functions
module.exports = {
    createComment,
    getPostComments
    // Add other functions as needed
};