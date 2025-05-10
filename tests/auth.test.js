const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../Backend/src/routes/auth.routes');
const { generateTestToken } = require('./setup');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
    describe('POST /auth/register', () => {
        it('should return 400 if email is missing', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({});
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Email is required');
        });

        it('should initiate registration with valid email', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({ email: 'test@example.com' });
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('POST /auth/verify-email', () => {
        it('should return 400 if email or code is missing', async () => {
            const res = await request(app)
                .post('/auth/verify-email')
                .send({});
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should verify email with valid code', async () => {
            const res = await request(app)
                .post('/auth/verify-email')
                .send({
                    email: 'test@example.com',
                    code: '123456'
                });
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('POST /auth/login', () => {
        it('should return 401 with invalid credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'wrongpassword'
                });
            
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .set('x-client-type', 'mobile')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toBeDefined();
            expect(res.body.token).toBeDefined();
        });
    });

    describe('POST /auth/verify-token', () => {
        it('should return 401 with no token', async () => {
            const res = await request(app)
                .post('/auth/verify-token')
                .set('x-client-type', 'mobile')
                .send({});
            
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should verify valid token', async () => {
            const token = generateTestToken('testUserId');
            const res = await request(app)
                .post('/auth/verify-token')
                .set('x-client-type', 'mobile')
                .send({ token });
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toBeDefined();
        });
    });
});