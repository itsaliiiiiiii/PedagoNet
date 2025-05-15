const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { 
    createConnection, 
    updateConnectionStatus, 
    getConnections, 
    refuseConnection,
    deleteConnection 
} = require('../services/connection.service');

// Send connection request
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const { receiverId } = req.body;

        // Check if connection already exists
        const existingConnections = await getConnections(req.user.id_user.toString());
        if (existingConnections.some(conn => conn.userId === receiverId)) {
            return res.status(400).json({
                success: false,
                message: 'Connection already exists'
            });
        }

        const success = await createConnection(req.user.id_user.toString(), receiverId);
        if (!success) {
            return res.status(500).json({ success: false, message: 'Failed to create connection' });
        }

        res.status(201).json({
            success: true,
            message: 'Connection request sent'
        });
    } catch (error) {
        console.error('Connection request error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Accept connection request
router.put('/accept/:receiverId', authenticateToken, async (req, res) => {
    try {
        const success = await updateConnectionStatus(
            req.params.receiverId,
            req.user.id_user.toString(),
            'accepted'
        );

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Connection request not found'
            });
        }

        res.json({
            success: true,
            message: 'Connection accepted'
        });
    } catch (error) {
        console.error('Connection acceptance error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Refuse connection request
router.put('/refuse/:senderId', authenticateToken, async (req, res) => {
    try {
        const success = await refuseConnection(
            req.params.senderId,
            req.user.id_user.toString()
        );

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Connection request not found'
            });
        }

        res.json({
            success: true,
            message: 'Connection request refused'
        });
    } catch (error) {
        console.error('Connection refuse error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get user's connections
router.get('/', authenticateToken, async (req, res) => {
    try {
        const connections = await getConnections(req.user.id_user.toString(), 'accepted');
        res.json({
            success: true,
            connections
        });
    } catch (error) {
        console.error('Connections retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get pending connection requests
router.get('/pending', authenticateToken, async (req, res) => {
    try {
        const pendingConnections = await getConnections(req.user.id_user.toString(), 'pending');
        res.json({
            success: true,
            pendingConnections
        });
    } catch (error) {
        console.error('Pending connections retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete existing connection
router.delete('/:userId', authenticateToken, async (req, res) => {
    try {
        const success = await deleteConnection(
            req.user.id_user.toString(),
            req.params.userId
        );

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Connection not found'
            });
        }

        res.json({
            success: true,
            message: 'Connection deleted successfully'
        });
    } catch (error) {
        console.error('Connection deletion error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;