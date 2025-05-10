const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const neo4j = require('neo4j-driver');
const jwt = require('jsonwebtoken');
const userService = require('../src/services/user.service');
const { neo4jDriver } = require('../src/config/database');

let mongoServer;
let neo4jSession;

// Setup MongoDB Memory Server and Neo4j test connection
beforeAll(async () => {
    // Setup MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup test environment variables
    process.env.NEO4J_URI = 'bolt://localhost:7687';
    process.env.NEO4J_USERNAME = 'neo4j';
    process.env.NEO4J_PASSWORD = 'testpassword';
    process.env.JWT_SECRET = 'test_secret_key';
    process.env.NODE_ENV = 'test';

    // Verify Neo4j connection
    try {
        await neo4jDriver.verifyConnectivity();
        neo4jSession = neo4jDriver.session();
        console.log('Neo4j test connection established');
    } catch (error) {
        console.error('Neo4j test connection failed:', error);
        throw error;
    }
});

beforeEach(async () => {
    // Clear both databases before each test
    await mongoose.connection.dropDatabase();
    if (neo4jSession) {
        await neo4jSession.run('MATCH (n) DETACH DELETE n');
    }
});

afterEach(async () => {
    // Additional cleanup if needed
    if (neo4jSession) {
        await neo4jSession.run('MATCH (n) DETACH DELETE n');
    }
});

afterAll(async () => {
    if (neo4jSession) {
        await neo4jSession.close();
    }
    if (neo4jDriver) {
        await neo4jDriver.close();
    }
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Helper function to create test user data
const createTestUser = async (role = 'student') => {
    const userData = {
        email: `test${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'User',
        role: role,
        password: 'testpassword',
        dateOfBirth: new Date('2000-01-01').toISOString()
    };

    const result = await userService.createUser(userData);
    if (!result.success) {
        console.error('User creation error:', result.error);
        throw new Error('Failed to create test user');
    }
    return result.user;
};

// Helper function to generate JWT token
const generateTestToken = (userId, role = 'student') => {
    return jwt.sign(
        { 
            id_user: userId,
            role: role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

module.exports = {
    generateTestToken,
    createTestUser,
    neo4jSession
};