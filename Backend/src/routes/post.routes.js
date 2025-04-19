const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const Post = require('../models/post.model');

// Create a new post
router.post('/', authenticateToken, async (req, res) => {
    try {
        const post = await Post.create({
            author: req.user._id,
            content: req.body.content,
            visibility: req.body.visibility || 'public',
            attachments: req.body.attachments
        });

        await post.populate('author', 'firstName lastName');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post
        });
    } catch (error) {
        console.error('Post creation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all posts (with visibility filtering)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const query = {
            $or: [
                { visibility: 'public' },
                { author: req.user._id },
                {
                    visibility: 'connections',
                    author: { $in: await getConnectedUserIds(req.user._id) }
                }
            ]
        };

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .populate('author', 'firstName lastName')
            .limit(parseInt(req.query.limit) || 10)
            .skip(parseInt(req.query.skip) || 0);

        res.json({
            success: true,
            posts
        });
    } catch (error) {
        console.error('Posts retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get a specific post
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'firstName lastName');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check visibility permissions
        if (post.visibility === 'private' && post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this post'
            });
        }

        if (post.visibility === 'connections' && 
            !(await isConnected(post.author, req.user._id)) && 
            post.author.toString() !== req.user._id.toString()) {
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
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post'
            });
        }

        post.content = req.body.content || post.content;
        post.visibility = req.body.visibility || post.visibility;
        post.attachments = req.body.attachments || post.attachments;
        post.updatedAt = Date.now();

        await post.save();
        await post.populate('author', 'firstName lastName');

        res.json({
            success: true,
            message: 'Post updated successfully',
            post
        });
    } catch (error) {
        console.error('Post update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete a post
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }

        await post.remove();

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
    const Connection = require('../models/connection.model');
    const connections = await Connection.find({
        $or: [
            { sender: userId },
            { receiver: userId }
        ],
        status: 'accepted'
    });

    return connections.map(conn => 
        conn.sender.toString() === userId.toString() ? conn.receiver : conn.sender
    );
}

// Helper function to check if two users are connected
async function isConnected(userId1, userId2) {
    const Connection = require('../models/connection.model');
    const connection = await Connection.findOne({
        $or: [
            { sender: userId1, receiver: userId2 },
            { sender: userId2, receiver: userId1 }
        ],
        status: 'accepted'
    });

    return !!connection;
}

module.exports = router;