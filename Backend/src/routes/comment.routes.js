const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
    createComment,
    getPostComments,
    getCommentReplies,
    updateComment,
    deleteComment
} = require('../services/comment.service');

// Create a new comment or reply
router.post('/', authenticateToken, async (req, res) => {
    try {
        const result = await createComment(
            req.user.id_user,
            req.body.postId,
            req.body.content,
            req.body.parentCommentId || null
        );

        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        console.error('Comment creation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get comments for a post
router.get('/post/:postId', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const result = await getPostComments(
            req.params.postId,
            limit,
            skip
        );

        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Comments retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get replies for a comment
router.get('/:commentId/replies', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const result = await getCommentReplies(
            req.params.commentId,
            limit,
            skip
        );

        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Comment replies retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update a comment
router.put('/:commentId', authenticateToken, async (req, res) => {
    try {
        const result = await updateComment(
            req.params.commentId,
            req.user.id_user,
            req.body.content
        );

        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Comment update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete a comment
router.delete('/:commentId', authenticateToken, async (req, res) => {
    try {
        const result = await deleteComment(req.params.commentId, req.user.id_user);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Comment deletion error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;