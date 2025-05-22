const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
    createMessage,
    getConversation,
    markMessageAsRead,
    getUnreadCount
} = require('../services/message.service');

// Send a message
router.post('/', authenticateToken, async (req, res) => {
    try {
        const result = await createMessage(req.user._id, req.body.receiverId, req.body.content);
        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        console.error('Message sending error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get conversation history
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;
        const result = await getConversation(req.user._id, req.params.userId, limit, skip);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Conversation retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Mark message as read
router.put('/:messageId/read', authenticateToken, async (req, res) => {
    try {
        const result = await markMessageAsRead(req.params.messageId, req.user._id);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get unread messages count
router.get('/unread/count', authenticateToken, async (req, res) => {
    try {
        const result = await getUnreadCount(req.user._id);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Unread count error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;