const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const Connection = require('../models/connection.model');

// Send connection request
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const { receiverId } = req.body;
        
        // Check if connection already exists
        const existingConnection = await Connection.findOne({
            $or: [
                { sender: req.user._id, receiver: receiverId },
                { sender: receiverId, receiver: req.user._id }
            ]
        });

        if (existingConnection) {
            return res.status(400).json({
                success: false,
                message: 'Connection already exists'
            });
        }

        const connection = await Connection.create({
            sender: req.user._id,
            receiver: receiverId
        });

        res.status(201).json({
            success: true,
            message: 'Connection request sent',
            connection
        });
    } catch (error) {
        console.error('Connection request error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Accept connection request
router.put('/accept/:connectionId', authenticateToken, async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.connectionId);
        
        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Connection request not found'
            });
        }

        if (connection.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to accept this connection'
            });
        }

        connection.status = 'accepted';
        connection.updatedAt = Date.now();
        await connection.save();

        res.json({
            success: true,
            message: 'Connection accepted',
            connection
        });
    } catch (error) {
        console.error('Connection acceptance error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Reject connection request
router.put('/reject/:connectionId', authenticateToken, async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.connectionId);
        
        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Connection request not found'
            });
        }

        if (connection.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reject this connection'
            });
        }

        connection.status = 'rejected';
        connection.updatedAt = Date.now();
        await connection.save();

        res.json({
            success: true,
            message: 'Connection rejected',
            connection
        });
    } catch (error) {
        console.error('Connection rejection error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get user's connections
router.get('/', authenticateToken, async (req, res) => {
    try {
        const connections = await Connection.find({
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ],
            status: 'accepted'
        }).populate('sender receiver', 'firstName lastName email');

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
        const pendingConnections = await Connection.find({
            receiver: req.user._id,
            status: 'pending'
        }).populate('sender', 'firstName lastName email');

        res.json({
            success: true,
            pendingConnections
        });
    } catch (error) {
        console.error('Pending connections retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;