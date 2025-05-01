const express = require('express');
const router = express.Router();
const { resendVerificationCode, initiateRegistration, verifyAndCreateAccount, login } = require('../services/auth.service');

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
        const { email, code } = req.body;
         if (!email || !code) {
         return res.status(400).json({ success: false, message: 'Missing required fields: email and code' });
        }
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

// POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
    try {
      const { email } = req.body;
      const result = await resendVerificationCode(email);
      if (result.success) {
        res.status(200).json({ message: 'Verification code resent successfully' });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error('Resend code error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
module.exports = router;