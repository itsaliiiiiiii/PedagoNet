const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const upload = require('../config/upload');
const { 
    getUserProfile, 
    updateUserProfile, 
    updateProfilePhoto 
} = require('../services/profile.service.js');

// Get user profile (owner) 
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await getUserProfile(req.user.id_user);
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get user profile (other user's) 
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const targetUserId = req.params.userId || req.user.id_user;
        const result = await getUserProfile(targetUserId);
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
    try {
        const result = await updateUserProfile(req.user.id_user, req.body);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update profile photo
router.put('/photo', authenticateToken, upload.single('profilePhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const result = await updateProfilePhoto(req.user.id_user, req.file.filename);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Profile photo update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;