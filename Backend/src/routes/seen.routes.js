const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { markPostAsSeen, getSeenPosts } = require('../services/connection.service');

// Mark a post as seen
router.post('/:postId', authenticateToken, async (req, res) => {
    try {
        const result = await markPostAsSeen(req.user.id_user, req.params.postId);
        
        if (!result) {
            return res.status(500).json({
                success: false,
                message: 'Failed to mark post as seen'
            });
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

// Get all seen posts for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const seenPosts = await getSeenPosts(req.user.id_user);
        
        res.json({
            success: true,
            seenPosts
        });
    } catch (error) {
        console.error('Get seen posts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;