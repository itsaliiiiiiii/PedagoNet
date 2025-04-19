const User = require('../models/user.model');
const VerificationCode = require('../models/verificationCode.model');
const { sendVerificationEmail } = require('./email.service');
const { generateToken } = require('./jwt.service');
const { SchoolUser } = require('../config/schoolDatabase');

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const initiateRegistration = async (userData) => {
    try {
        // Check if user already exists in our application database
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            return { success: false, message: 'Email already registered in our system' };
        }

        // Verify against school database
        const schoolUser = await SchoolUser.findOne({ email: userData.email });
        if (!schoolUser) {
            return { success: false, message: 'Email not found in school records' };
        }

        // Generate and store verification code
        const code = generateVerificationCode();
        await VerificationCode.create({
            email: userData.email,
            code: code
        });

        // Send verification email
        const emailSent = await sendVerificationEmail(userData.email, code);
        if (!emailSent) {
            return { success: false, message: 'Failed to send verification email' };
        }

        return { 
            success: true, 
            message: 'Verification code sent successfully',
            userData: {
                firstName: schoolUser.firstName,
                lastName: schoolUser.lastName,
                role: schoolUser.role
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
        const verificationRecord = await VerificationCode.findOne({ email, code });
        if (!verificationRecord) {
            return { success: false, message: 'Invalid or expired verification code' };
        }

        // Verify against school database again
        const schoolUser = await SchoolUser.findOne({ email });
        if (!schoolUser) {
            return { success: false, message: 'User not found in school records' };
        }

        // Create new user with data from school database
        const user = await User.create({
            email,
            password: userData.password,
            firstName: schoolUser.firstName,  // Make sure these fields exist in schoolUser
            lastName: schoolUser.lastName,    // Make sure these fields exist in schoolUser
            dateOfBirth: userData.dateOfBirth,
            role: schoolUser.role,           // Make sure this field exists in schoolUser
            isVerified: true
        });

        // Add debug logging
        console.log('School user data:', schoolUser);
        console.log('Created user data:', user);

        // Delete verification code
        await VerificationCode.deleteOne({ email, code });

        // Generate JWT token
        const token = generateToken(user);

        return { 
            success: true, 
            message: 'Account created successfully',
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
        const user = await User.findOne({ email });
        if (!user) {
            return { success: false, message: 'Invalid credentials' };
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return { success: false, message: 'Invalid credentials' };
        }

        // Generate JWT token
        const token = generateToken(user);

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