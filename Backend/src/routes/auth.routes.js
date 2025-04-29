const express = require('express');
const router = express.Router();
const { initiateRegistration, verifyEmail, login, createAccount } = require('../services/auth.service');

// Step 1: Submit email & send verification code
router.post('/register', async (req, res) => {
    try {
        if (!req.body?.email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        const result = await initiateRegistration({ email: req.body.email });
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Step 2: Verify email with code
router.post('/verify-email', async (req, res) => {
    try {
        if (!req.body?.email || !req.body?.code) {
            return res.status(400).json({ success: false, message: 'Email and verification code are required' });
        }
        const result = await verifyEmail(req.body.email, req.body.code);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Step 3: Set password and create account
router.post('/create-account', async (req, res) => {
    try {
        if (!req.body?.email || !req.body?.password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // First verify that the email has been verified
        const verificationResult = await verifyEmail(req.body.email, req.body.code);
        if (!verificationResult.success) {
            return res.status(400).json({ success: false, message: 'Email must be verified before creating account' });
        }

        const result = await createAccount(req.body.email, req.body.password);
        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        console.error('Account creation error:', error);
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