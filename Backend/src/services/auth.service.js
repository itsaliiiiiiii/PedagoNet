const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('./email.service');
const { generateToken } = require('./jwt.service');
require('dotenv').config();


const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const initiateRegistration = async (userData) => {
    try {
        // Check if user already exists
        const userExists = await authRepository.checkExistingUser(userData.email);
        if (userExists) {
            return { success: false, message: 'Email already registered in our system' };
        }

        // Generate verification code
        const code = generateVerificationCode();

        // Store verification code
        await authRepository.createVerificationCode(userData.email, code);

        // Send verification email
        const emailSent = await sendVerificationEmail(userData.email, code);
        if (!emailSent) {
            return { success: false, message: 'Failed to send verification email' };
        }

        return {
            success: true,
            message: 'Verification code sent successfully',
            userData: {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role
            }
        };
    } catch (error) {
        console.error('Registration initiation error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const verifyAndCreateAccount = async (email, code, userData) => {
    try {
        // Find and validate verification code
        const verificationCode = await authRepository.findVerificationCode(email, code);
        if (!verificationCode) {
            return { success: false, message: 'Invalid or expired verification code' };
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create new user
        const id_user = require('crypto').randomUUID();
        const result = await authRepository.createUser(userData, hashedPassword, id_user);

        const userNode = result.records[0].get('u');
        const user = {
            id_user: userNode.properties.id_user,
            email: userNode.properties.email,
            role: userNode.properties.role
        };
        console.log(user);

        // Verify password
        if (!password) {
            return { success: false, message: 'Password is required' };
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return { success: false, message: 'Incorrect password' };
        }

        // Generate JWT token
        const token = generateToken({
            id_user: user.id_user,
            email: user.email,
            role: user.role
        });

        return {
            success: true,
            message: 'Login successful',
            token: token
        };
    } catch (error) {
        console.error('Account creation error details:', error);
        return {
            success: false,
            message: 'Failed to create account: ' + error.message
        };
    }
};

const login = async (email, password) => {
    try {
        // Find user
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            return { success: false, message: 'Email not found' };
        }
        console.log(user);

        // Verify password
        if (!password) {
            return { success: false, message: 'Password is required' };
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return { success: false, message: 'Incorrect password' };
        }

        // Generate JWT token
        const token = generateToken({
            id_user: user.id_user,
            email: user.email,
            role: user.role
        });

        return {
            success: true,
            message: 'Login successful',
            token: token
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    initiateRegistration,
    verifyAndCreateAccount,
    login
};