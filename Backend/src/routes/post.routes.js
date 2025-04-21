const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { createPost, getPosts, getPostById, updatePost, deletePost } = require('../services/post.service');
const { getConnections } = require('../services/neo4j.service');


// Create a new post
router.post('/', authenticateToken, async (req, res) => {
    try {
        const result = await createPost(
            req.user.id_user,
            req.body.visibility || 'public',
            req.body.content,
            req.body.attachments || []
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

// Get all posts (with visibility filtering)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const connectedUserIds = await getConnectedUserIds(req.user.id_user);
        const result = await getPosts(
            req.user.id_user,
            connectedUserIds,
            parseInt(req.query.limit) || 10,
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

module.exports = router;