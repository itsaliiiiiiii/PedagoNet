const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (user) => {
    return jwt.sign(
        {
            id_user: user.id_user,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return {
            id_user: decoded.id_user,
            email: decoded.email,
            role: decoded.role
        };
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken
};