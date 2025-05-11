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
        const attachmentStrings = attachments.map(attachment => JSON.stringify({
            filename: attachment.filename,
            originalName: attachment.originalName,
            mimetype: attachment.mimetype,
            size: attachment.size
        }));

        const result = await postRepository.createPost(authorId, content, visibility, attachmentStrings);
        if (!result) {
            return { success: false, message: 'Failed to create post' };
        }

        const { post, author } = result;
        return {
            success: true,
            post: {
                ...post,
                attachments: post.attachments.map(att => JSON.parse(att)),
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
            attachments: post.attachments ? post.attachments.map(att => JSON.parse(att)) : [],
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

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    markPostAsSeen,
    getSeenPosts,
    getUserPosts  // Add this to exports
};
