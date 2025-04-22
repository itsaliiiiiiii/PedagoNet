const express = require('express');
const router = express.Router();
const { initiateRegistration, verifyAndCreateAccount, login } = require('../services/auth.service');

// Step 1: Check email & send verification code
router.post('/register', async (req, res) => {
    try {
        if (!req.body?.email) {
            return res.status(400).json({ success: false, message: 'Missing required fields: email and code' });
        }
        const result = await initiateRegistration(req.body);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Step 2: Verify code & create account
router.post('/verify', async (req, res) => {
    try {
        if (!req.body?.email || !req.body?.code) {
            return res.status(400).json({ success: false, message: 'Missing required fields: email and code' });
        }
        const { email, code, ...userData } = req.body;
        const result = await verifyAndCreateAccount(email, code, userData);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Login with JWT
router.post('/login', async (req, res) => {
    // complete login
    try {
        const { email, password } = req.body;
        const result = await login(email, password);
        res.status(result.success ? 200 : 401).json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;