const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const upload = require('../config/upload');
const { 
    createPost, 
    getPosts, 
    getPostById, 
    updatePost, 
    deletePost,
    markPostAsSeen,
    getSeenPosts,
    getUserPosts,
    toggleLike,
    getPostLikedUsers  // Add this import
} = require('../services/post.service');
const {
    addComment,
    getComments,
    updateComment,
    deleteComment,
    addReply,
    getReplies,
    toggleLike: toggleCommentLike
} = require('../services/comment.service');
const { getConnections } = require('../services/connection.service');

// Create a new post with file uploads
router.post('/', authenticateToken, upload.array('attachments', 5), async (req, res) => {
    try {
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        })) : [];

        const result = await createPost(
            req.user.id_user,
            req.body.content,
            req.body.visibility || 'public',
            attachments
        );

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: result.post
        });
    } catch (error) {
        console.error('Post creation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update a post with file uploads
router.put('/:id', authenticateToken, upload.array('attachments', 5), async (req, res) => {
    try {
        const newAttachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        })) : [];

        const existingAttachments = req.body.existingAttachments ? JSON.parse(req.body.existingAttachments) : [];

        const result = await updatePost(
            req.params.id,
            req.user.id_user,
            {
                content: req.body.content,
                visibility: req.body.visibility,
                attachments: [...existingAttachments, ...newAttachments]
            }
        );

        if (!result.success) {
            return res.status(result.message.includes('not found') ? 404 : 403).json(result);
        }

        res.json({
            success: true,
            message: 'Post updated successfully',
            post: result.post
        });
    } catch (error) {
        console.error('Post update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all posts (with visibility filtering)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const connectedUserIds = await getConnectedUserIds(req.user.id_user);
        const result = await getPosts(
            req.user.id_user,
            connectedUserIds,
            parseInt(req.query.limit) || 100,
            parseInt(req.query.skip) || 0
        );

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json({
            success: true,
            posts: result.posts
        });
    } catch (error) {
        console.error('Posts retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get a specific post
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await getPostById(req.params.id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        const post = result.post;

        // Check visibility permissions
        if (post.visibility === 'private' && post.author.id !== req.user.id_user) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this post'
            });
        }

        if (post.visibility === 'connections' && 
            !(await isConnected(post.author.id, req.user.id_user)) && 
            post.author.id !== req.user.id_user) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this post'
            });
        }

        res.json({
            success: true,
            post
        });
    } catch (error) {
        console.error('Post retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update a post
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await updatePost(
            req.params.id,
            req.user.id_user,

            {
                content: req.body.content,
                visibility: req.body.visibility,
                attachments: req.body.attachments
            }
        );

        if (!result.success) {
            return res.status(result.message.includes('not found') ? 404 : 403).json(result);
        }

        res.json({
            success: true,
            message: 'Post updated successfully',
            post: result.post
        });
    } catch (error) {
        console.error('Post update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete a post
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await deletePost(req.params.id, req.user.id_user);

        
        if (!result.success) {
            return res.status(result.message.includes('not found') ? 404 : 403).json(result);
        }

        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Post deletion error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Helper function to get connected user IDs
async function getConnectedUserIds(userId) {
    const connections = await getConnections(userId, 'accepted');
    console.log(connections);
    return connections.map(conn => conn.userId);
}

// Helper function to check if two users are connected
async function isConnected(userId1, userId2) {
    const connections = await getConnections(userId1);
    return connections.some(conn => conn.userId === userId2 && conn.status === 'accepted');
}

// Mark a post as seen
router.post('/:id/seen', authenticateToken, async (req, res) => {
    try {
        const result = await markPostAsSeen(req.user.id_user, req.params.id);
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json({
            success: true,
            message: 'Post marked as seen'
        });
    } catch (error) {
        console.error('Mark post as seen error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all seen posts
router.get('/seen', authenticateToken, async (req, res) => {
    try {
        const result = await getSeenPosts(req.user.id_user);
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json({
            success: true,
            seenPosts: result.seenPosts
        });
    } catch (error) {
        console.error('Get seen posts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get a specific post (moved after /seen to avoid route conflicts)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await getPostById(req.params.id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        const post = result.post;

        // Check visibility permissions
        if (post.visibility === 'private' && post.author.id !== req.user.id_user) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this post'
            });
        }

        if (post.visibility === 'connections' && 
            !(await isConnected(post.author.id, req.user.id_user)) && 
            post.author.id !== req.user.id_user) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this post'
            });
        }

        res.json({
            success: true,
            post
        });
    } catch (error) {
        console.error('Post retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all posts by user ID
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const viewerId = req.user.id_user;
        const isViewerConnected = await isConnected(targetUserId, viewerId);
        
        const result = await getUserPosts(targetUserId, viewerId, isViewerConnected);

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json({
            success: true,
            posts: result.posts
        });
    } catch (error) {
        console.error('User posts retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get users who liked a post
router.get('/:id/likes', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;
        
        const users = await getPostLikedUsers(req.params.id, limit, skip);

        res.json({
            success: true,
            users: users || [],
            pagination: {
                limit,
                skip,
                hasMore: users && users.length === limit
            }
        });
    } catch (error) {
        console.error('Get post likes error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get post likes',
            error: error.message 
        });
    }
});

// Comment routes
router.post('/:postId/comments', authenticateToken, async (req, res) => {
    try {
        const result = await addComment(req.params.postId, req.user.id_user, req.body.content);
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.status(201).json(result);
    } catch (error) {
        console.error('Comment creation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/:postId/comments', authenticateToken, async (req, res) => {
    try {
        const result = await getComments(
            req.params.postId,
            parseInt(req.query.limit) || 10,
            parseInt(req.query.skip) || 0
        );
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (error) {
        console.error('Comments retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.put('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
    try {
        const result = await updateComment(
            req.params.commentId,
            req.user.id_user,
            req.body.content
        );
        if (!result.success) {
            return res.status(result.message.includes('not found') ? 404 : 403).json(result);
        }
        res.json(result);
    } catch (error) {
        console.error('Comment update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.delete('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
    try {
        const result = await deleteComment(req.params.commentId, req.user.id_user);
        if (!result.success) {
            return res.status(result.message.includes('not found') ? 404 : 403).json(result);
        }
        res.json(result);
    } catch (error) {
        console.error('Comment deletion error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Reply routes
router.post('/:postId/comments/:commentId/replies', authenticateToken, async (req, res) => {
    try {
        const result = await addReply(
            req.params.commentId,
            req.user.id_user,
            req.body.content
        );
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.status(201).json(result);
    } catch (error) {
        console.error('Reply creation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/:postId/comments/:commentId/replies', authenticateToken, async (req, res) => {
    try {
        const result = await getReplies(
            req.params.commentId,
            parseInt(req.query.limit) || 10,
            parseInt(req.query.skip) || 0
        );
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (error) {
        console.error('Replies retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Comment like routes
router.post('/:postId/comments/:commentId/like', authenticateToken, async (req, res) => {
    try {
        const result = await toggleCommentLike(req.params.commentId, req.user.id_user);
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (error) {
        console.error('Comment like toggle error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/:postId/comments/:commentId/replies/:replyId/like', authenticateToken, async (req, res) => {
    try {
        const result = await toggleCommentLike(
            req.params.commentId,
            req.user.id_user,
            true,
            req.params.replyId
        );
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (error) {
        console.error('Reply like toggle error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Toggle like on a post
router.post('/:id/like', authenticateToken, async (req, res) => {
    try {
        const result = await toggleLike(req.params.id, req.user.id_user);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error toggling post like:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
