const neo4j = require('neo4j-driver');
const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('./email.service');
const { generateToken } = require('./jwt.service');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const initiateRegistration = async (userData) => {
    const session = driver.session();
    try {
        // Check if user already exists in our application database
        const existingUserResult = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email: userData.email.toLowerCase() }
        );

        if (existingUserResult.records.length > 0) {
            return { success: false, message: 'Email already registered in our system' };
        }

        // Generate verification code
        const code = generateVerificationCode();

        // Store verification code in Neo4j
        await session.run(
            `CREATE (v:VerificationCode {
                email: $email,
                code: $code,
                createdAt: datetime()
            })`,
            { email: userData.email.toLowerCase(), code }
        );

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
    } finally {
        await session.close();
    }
};

const verifyAndCreateAccount = async (email, code, userData) => {
    const session = driver.session();
    try {
        // Find and validate verification code
        const verificationResult = await session.run(
            `MATCH (v:VerificationCode {email: $email, code: $code})
             WHERE datetime() < v.createdAt + duration('PT1H')
             RETURN v`,
            { email: email.toLowerCase(), code }
        );

        if (verificationResult.records.length === 0) {
            return { success: false, message: 'Invalid or expired verification code' };
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create new user
        const result = await session.run(
            `CREATE (u:User {
                id: randomUUID(),
                email: $email,
                password: $password,
                firstName: $firstName,
                lastName: $lastName,
                dateOfBirth: datetime($dateOfBirth),
                role: $role,
                isVerified: true,
                createdAt: datetime(),
                updatedAt: datetime()
            }) RETURN u`,
            {
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                dateOfBirth: userData.dateOfBirth,
                role: userData.role
            }
        );

        const user = result.records[0].get('u').properties;

        // Delete verification code
        await session.run(
            'MATCH (v:VerificationCode {email: $email}) DELETE v',
            { email: email.toLowerCase() }
        );

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
    } finally {
        await session.close();
    }
};

const login = async (email, password) => {
    const session = driver.session();
    try {
        // Find user
        const result = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email: email.toLowerCase() }
        );

        if (result.records.length === 0) {
            return { success: false, message: 'Email not found' };
        }

        const user = result.records[0].get('u').properties;

        // Verify password
        if (!password) {
            return { success: false, message: 'Password is required' };
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return { success: false, message: 'Incorrect password' };
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
    } finally {
        await session.close();
    }
};

module.exports = {
    initiateRegistration,
    verifyAndCreateAccount,
    login
};