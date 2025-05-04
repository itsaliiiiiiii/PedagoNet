const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('./email.service');
const { generateToken } = require('./jwt.service');
const authRepository = require('../repositories/auth.repository');
const SchoolUser = require('../models/schoolUser.model');
require('dotenv').config();


const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const initiateRegistration = async (userData) => {
    try {
        // Check if email exists in school database
        const schoolUser = await SchoolUser.findOne({ email: userData.email });
        if (!schoolUser) {
            return { success: false, message: 'Email not found in school database' };
        }

        // Check if user already exists in our system
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

const verifyEmail = async (email, code) => {
    try {
        // Find and validate verification code
        const verificationCode = await authRepository.findVerificationCode(email, code);
        if (!verificationCode) {
            return { success: false, message: 'Invalid or expired verification code' };
        }

        return {
            success: true,
            message: 'Email verified successfully'
        };
    } catch (error) {
        console.error('Email verification error:', error);
        return { success: false, message: error.message };
    }
};

const createAccount = async (email, password) => {
    try {
        // Get user data from school database
        const schoolUser = await SchoolUser.findOne({ email });
        if (!schoolUser) {
            return { success: false, message: 'User not found in school database' };
        }

        // Format dateOfBirth for Neo4j
        const formattedDateOfBirth = new Date(schoolUser.dateOfBirth).toISOString();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with data from school database
        const id_user = require('crypto').randomUUID();
        await authRepository.createUser({
            ...schoolUser.toObject(),
            dateOfBirth: formattedDateOfBirth,
            password: hashedPassword
        }, hashedPassword, id_user);

        // Generate JWT token
        const token = generateToken({
            id_user: id_user,
            email: email,
            role: schoolUser.role
        });

        return {
            success: true,
            message: 'Account created successfully',
            token: token
        };
    } catch (error) {
        console.error('Account creation error:', error);
        return { success: false, message: error.message };
    }
};

const verifyAndCreateAccount = async (email, code, userData) => {
    try {
        // Find and validate verification code
        const verificationCode = await authRepository.findVerificationCode(email, code);
        if (!verificationCode) {
            return { success: false, message: 'Invalid or expired verification code' };
        }

        // Get user data from school database
        const schoolUser = await SchoolUser.findOne({ email });
        if (!schoolUser) {
            return { success: false, message: 'User not found in school database' };
        }

        // Format dateOfBirth for Neo4j
        const formattedDateOfBirth = new Date(schoolUser.dateOfBirth).toISOString();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create new user with data from school database
        const id_user = require('crypto').randomUUID();
        const result = await authRepository.createUser({
            ...schoolUser.toObject(),
            dateOfBirth: formattedDateOfBirth,
            password: hashedPassword
        }, hashedPassword, id_user);

        const userNode = result.records[0].get('u');
        const user = {
            id_user: userNode.properties.id_user,
            email: userNode.properties.email,
            role: userNode.properties.role,
            password: hashedPassword
        };

        // Verify password
        if (!userData.password) {
            return { success: false, message: 'Password is required' };
        }

        const isValidPassword = await bcrypt.compare(userData.password, user.password);
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
        console.error('Account creation error:', error);
        return { success: false, message: error.message };
    }
};

const login = async (email, password) => {
    try {
        // Find user
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            return { success: false, message: 'Email not found' };
        }

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
            token: token,
            user: {
                id_user: user.id_user,
                email: user.email,
                role: user.role
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    initiateRegistration,
    verifyEmail,
    createAccount,
    login
};