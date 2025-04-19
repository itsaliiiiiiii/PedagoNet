const { verifyToken } = require('../services/jwt.service');
const User = require('../models/user.model');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access token is required' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    authenticateToken
};