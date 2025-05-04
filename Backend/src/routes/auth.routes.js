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
    try {
        const { email, password } = req.body;
        const clientType = req.headers['x-client-type'] || 'web'; // Default to web if not specified
        
        const result = await login(email, password);
        
        if (!result.success) {
            return res.status(401).json(result);
        }

        if (clientType === 'web') {
            // Set JWT in HTTP-only cookie for web clients
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Only use secure in production
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours (match JWT_EXPIRES_IN)
            });

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: result.user
            });
        } else {
            // Send token in response body for mobile clients
            return res.status(200).json(result);
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;