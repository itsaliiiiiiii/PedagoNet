const neo4j = require('neo4j-driver');
require('dotenv').config();

const postRepository = require('../repositories/post.repository');

const formatAuthor = (author) => ({
    id: author.id_user,
    firstName: author.firstName,
    lastName: author.lastName,
    profilePhotoUrl: author.profilePhoto ? `/upload/${author.profilePhoto.filename}` : null
});

const createPost = async (authorId, content, visibility = 'public', attachments = []) => {
    try {
        // Attachments are already in the correct format from multer
        const result = await postRepository.createPost(authorId, content, visibility, attachments);
        if (!result) {
            return { success: false, message: 'Failed to create post' };
        }

        const { post, author } = result;
        return {
            success: true,
            post: {
                ...post,
                attachments: post.attachments, // No need to parse
                author: formatAuthor(author)
            }
        };
    } catch (error) {
        console.error('Post creation error:', error);
        return { success: false, message: 'Failed to create post' };
    }
};

const getPosts = async (userId, connectedUserIds, limit = 10, skip = 0) => {
    try {
        const results = await postRepository.getPosts(userId, connectedUserIds, limit, skip);
        const posts = results.map(({ post, author }) => ({
            ...post,
            attachments: post.attachments || [], // No need to parse, they're already objects
            author: formatAuthor(author)
        }));

        return { success: true, posts };
    } catch (error) {
        console.error('Posts retrieval error:', error);
        return { success: false, message: 'Failed to retrieve posts' };
    }
};

const getPostById = async (postId) => {
    try {
        const result = await postRepository.getPostById(postId);
        if (!result) {
            return { success: false, message: 'Post not found' };
        }

        const { post, author } = result;
        return {
            success: true,
            post: {
                ...post,
                attachments: post.attachments ? post.attachments.map(att => JSON.parse(att)) : [],
                author: {
                    id: author.id_user,
                    firstName: author.firstName,
                    lastName: author.lastName
                }
            }
        };
    } catch (error) {
        console.error('Post retrieval error:', error);
        return { success: false, message: 'Failed to retrieve post' };
    }
};

const updatePost = async (postId, authorId, updates) => {
    try {
        if (updates.attachments) {
            updates.attachments = updates.attachments.map(att => 
                typeof att === 'string' ? att : JSON.stringify(att)
            );
        }

        const result = await postRepository.updatePost(postId, authorId, updates);
        if (!result) {
            return { success: false, message: 'Post not found or not authorized' };
        }

        const { post, author } = result;
        return {
            success: true,
            post: {
                ...post,
                attachments: post.attachments ? post.attachments.map(att => JSON.parse(att)) : [],
                author: {
                    id: author.id_user,
                    firstName: author.firstName,
                    lastName: author.lastName
                }
            }
        };
    } catch (error) {
        console.error('Post update error:', error);
        return { success: false, message: 'Failed to update post' };
    }
};

const deletePost = async (postId, authorId) => {
    try {
        const deleted = await postRepository.deletePost(postId, authorId);
        return {
            success: deleted,
            message: deleted ? 'Post deleted successfully' : 'Post not found or not authorized'
        };
    } catch (error) {
        console.error('Post deletion error:', error);
        return { success: false, message: 'Failed to delete post' };
    }
};

const markPostAsSeen = async (userId, postId) => {
    try {
        const marked = await postRepository.markPostAsSeen(userId, postId);
        return {
            success: marked,
            message: marked ? 'Post marked as seen' : 'Failed to mark post as seen'
        };
    } catch (error) {
        console.error('Mark post as seen error:', error);
        return { success: false, message: 'Failed to mark post as seen' };
    }
};

const getSeenPosts = async (userId) => {
    try {
        const seenPosts = await postRepository.getSeenPosts(userId);
        return {
            success: true,
            seenPosts
        };
    } catch (error) {
        console.error('Get seen posts error:', error);
        return { success: false, message: 'Failed to get seen posts' };
    }
};

const getUserPosts = async (targetUserId, viewerId, isViewerConnected) => {
    try {
        const results = await postRepository.getUserPosts(targetUserId, viewerId, isViewerConnected);
        const posts = results.map(({ post, author }) => ({
            ...post,
            attachments: post.attachments ? post.attachments.map(att => JSON.parse(att)) : [],
            author: {
                id: author.id_user,
                firstName: author.firstName,
                lastName: author.lastName
            }
        }));

        return { success: true, posts };
    } catch (error) {
        console.error('User posts retrieval error:', error);
        return { success: false, message: 'Failed to retrieve user posts' };
    }
};

const getPostLikedUsers = async (postId) => {
    try {
        const users = await postRepository.getPostLikedUsers(postId);
        return {
            success: true,
            users: users.map(user => ({
                id: user.id_user,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePhotoUrl: user.profilePhoto ? `/upload/${user.profilePhoto.filename}` : null
            }))
        };
    } catch (error) {
        console.error('Get post liked users error:', error);
        return { success: false, message: 'Failed to get users who liked the post' };
    }
};

const addComment = async (postId, userId, content) => {
    try {
        const result = await postRepository.addComment(postId, userId, content);
        if (!result) {
            return { success: false, message: 'Failed to add comment' };
        }

        const { comment, author } = result;
        return {
            success: true,
            comment: {
                ...comment,
                author: formatAuthor(author)
            }
        };
    } catch (error) {
        console.error('Comment creation error:', error);
        return { success: false, message: 'Failed to add comment' };
    }
};

const getComments = async (postId, limit = 10, skip = 0) => {
    try {
        const results = await postRepository.getComments(postId, limit, skip);
        const comments = results.map(({ comment, author }) => ({
            ...comment,
            author: formatAuthor(author)
        }));

        return { success: true, comments };
    } catch (error) {
        console.error('Comments retrieval error:', error);
        return { success: false, message: 'Failed to retrieve comments' };
    }
};

const updateComment = async (commentId, userId, content) => {
    try {
        const result = await postRepository.updateComment(commentId, userId, content);
        if (!result) {
            return { success: false, message: 'Comment not found or not authorized' };
        }

        const { comment, author } = result;
        return {
            success: true,
            comment: {
                ...comment,
                author: formatAuthor(author)
            }
        };
    } catch (error) {
        console.error('Comment update error:', error);
        return { success: false, message: 'Failed to update comment' };
    }
};

const deleteComment = async (commentId, userId) => {
    try {
        const deleted = await postRepository.deleteComment(commentId, userId);
        return {
            success: deleted,
            message: deleted ? 'Comment deleted successfully' : 'Comment not found or not authorized'
        };
    } catch (error) {
        console.error('Comment deletion error:', error);
        return { success: false, message: 'Failed to delete comment' };
    }
};

const addReply = async (commentId, userId, content) => {
    try {
        const result = await postRepository.addReply(commentId, userId, content);
        if (!result) {
            return { success: false, message: 'Failed to add reply' };
        }

        const { reply, author } = result;
        return {
            success: true,
            reply: {
                ...reply,
                author: formatAuthor(author)
            }
        };
    } catch (error) {
        console.error('Reply creation error:', error);
        return { success: false, message: 'Failed to add reply' };
    }
};

const getReplies = async (commentId, limit = 10, skip = 0) => {
    try {
        const results = await postRepository.getReplies(commentId, limit, skip);
        const replies = results.map(({ reply, author }) => ({
            ...reply,
            author: formatAuthor(author)
        }));

        return { success: true, replies };
    } catch (error) {
        console.error('Replies retrieval error:', error);
        return { success: false, message: 'Failed to retrieve replies' };
    }
};

const toggleLike = async (postId, userId) => {
    try {
        const result = await postRepository.toggleLike(postId, userId);
        return {
            success: true,
            liked: result.liked,
            message: result.liked ? 'Post liked' : 'Post unliked'
        };
    } catch (error) {
        console.error('Like toggle error:', error);
        return { success: false, message: 'Failed to toggle like' };
    }
};

const getLikes = async (postId, limit = 10, skip = 0) => {
    try {
        const users = await postRepository.getPostLikedUsers(postId, limit, skip);
        return {
            success: true,
            users: users.map(user => formatAuthor(user))
        };
    } catch (error) {
        console.error('Get likes error:', error);
        return { success: false, message: 'Failed to get likes' };
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    markPostAsSeen,
    getSeenPosts,
    getUserPosts,
    getPostLikedUsers,
    addComment,
    getComments,
    updateComment,
    deleteComment,
    addReply,
    getReplies,
    toggleLike,
    getLikes
};
