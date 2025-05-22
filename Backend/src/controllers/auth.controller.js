const authService = require('../services/auth.service');

class AuthController {
    async initiateRegistration(req, res) {
        try {
            const result = await authService.initiateRegistration(req.body);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error('Registration initiation error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async verifyAndCreateAccount(req, res) {
        try {
            const { email, code } = req.body;
            const userData = req.body.userData;

            const result = await authService.verifyAndCreateAccount(email, code, userData);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            console.error('Account creation error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            return res.status(result.success ? 200 : 401).json(result);
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

module.exports = new AuthController();