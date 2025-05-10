const request = require('supertest');
const express = require('express');
const connectionRoutes = require('../Backend/src/routes/connection.routes');
const { generateTestToken, createTestUser } = require('./setup');
const { neo4jDriver } = require('../Backend/src/config/database');
const neo4jService = require('../Backend/src/services/neo4j.service');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    req.cookies = {}; // Mock cookies for testing
    next();
});
app.use('/connections', connectionRoutes);

describe('Connection Routes', () => {
    let user1;
    let user1Token;
    let user2;
    let user2Token;

    beforeAll(async () => {
        // Create test users using the actual user service
        user1 = await createTestUser();
        user1Token = generateTestToken(user1.id_user);
        user2 = await createTestUser();
        user2Token = generateTestToken(user2.id_user);

        // Create initial connection for testing
        const session = neo4jDriver.session();
        try {
            await session.run(
                'MATCH (u1:User {id_user: $user1Id}), (u2:User {id_user: $user2Id}) ' +
                'CREATE (u1)-[:CONNECTION {status: "pending", createdAt: datetime()}]->(u2)',
                { user1Id: user1.id_user, user2Id: user2.id_user }
            );
        } finally {
            await session.close();
        }
    });

    afterEach(async () => {
        // Clean up test connections after each test
        const session = neo4jDriver.session();
        await session.run('MATCH ()-[r:CONNECTION]->() DELETE r');
        await session.close();
    });

    describe('POST /connections/request', () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .post('/connections/request')
                .send({ receiverId: user2.id_user });
            
            expect(res.status).toBe(401);
        });

        it('should create connection request successfully', async () => {
            const res = await request(app)
                .post('/connections/request')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ receiverId: user2.id_user });
            
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Connection request sent');
        });

        it('should return 400 if connection already exists', async () => {
            const res = await request(app)
                .post('/connections/request')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ receiverId: user2.id_user });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Connection already exists');
        });
    });

    describe('PUT /connections/accept/:receiverId', () => {
        it('should accept connection request successfully', async () => {
            const res = await request(app)
                .put(`/connections/accept/${user1.id_user}`)
                .set('Authorization', `Bearer ${user2Token}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Connection accepted');
        });

        it('should return 404 if connection request not found', async () => {
            const res = await request(app)
                .put('/connections/accept/nonexistentId')
                .set('Authorization', `Bearer ${user2Token}`);
            
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Connection request not found');
        });
    });

    describe('GET /connections', () => {
        it('should get all accepted connections', async () => {
            const res = await request(app)
                .get('/connections')
                .set('Authorization', `Bearer ${user1Token}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.connections)).toBe(true);
        });
    });

    describe('GET /connections/pending', () => {
        it('should get pending connection requests', async () => {
            const res = await request(app)
                .get('/connections/pending')
                .set('Authorization', `Bearer ${user1Token}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.pendingConnections)).toBe(true);
        });
    });
});