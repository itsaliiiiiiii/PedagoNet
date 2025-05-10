const request = require('supertest');
const express = require('express');
const postRoutes = require('../Backend/src/routes/post.routes');
const { generateTestToken, createTestUser } = require('./setup');

const app = express();
app.use(express.json());
app.use('/posts', postRoutes);

describe('Post Routes', () => {
    let testUser;
    let testToken;

    beforeAll(async () => {
        testUser = await createTestUser();
        testToken = generateTestToken(testUser.id_user);
    });

    describe('POST /posts', () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .post('/posts')
                .send({
                    content: 'Test post',
                    visibility: 'public'
                });
            
            expect(res.status).toBe(401);
        });

        it('should create a post successfully', async () => {
            const res = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    content: 'Test post',
                    visibility: 'public'
                });
            
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.post).toBeDefined();
            expect(res.body.post.content).toBe('Test post');
        });
    });

    describe('GET /posts', () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/posts');
            expect(res.status).toBe(401);
        });

        it('should get posts successfully', async () => {
            const res = await request(app)
                .get('/posts')
                .set('Authorization', `Bearer ${testToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.posts)).toBe(true);
        });
    });

    describe('PUT /posts/:id', () => {
        let postId;

        beforeAll(async () => {
            const createRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    content: 'Post to update',
                    visibility: 'public'
                });
            postId = createRes.body.post.id;
        });

        it('should update post successfully', async () => {
            const res = await request(app)
                .put(`/posts/${postId}`)
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    content: 'Updated content',
                    visibility: 'private'
                });
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.post.content).toBe('Updated content');
        });

        it('should return 403 if updating another user\'s post', async () => {
            const anotherToken = generateTestToken('anotherUserId');
            const res = await request(app)
                .put(`/posts/${postId}`)
                .set('Authorization', `Bearer ${anotherToken}`)
                .send({
                    content: 'Unauthorized update'
                });
            
            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /posts/:id', () => {
        let postId;

        beforeAll(async () => {
            const createRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    content: 'Post to delete',
                    visibility: 'public'
                });
            postId = createRes.body.post.id;
        });

        it('should delete post successfully', async () => {
            const res = await request(app)
                .delete(`/posts/${postId}`)
                .set('Authorization', `Bearer ${testToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 404 if post not found', async () => {
            const res = await request(app)
                .delete(`/posts/nonexistentId`)
                .set('Authorization', `Bearer ${testToken}`);
            
            expect(res.status).toBe(404);
        });
    });

    describe('POST /posts/:id/seen', () => {
        let postId;

        beforeAll(async () => {
            const createRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    content: 'Post to mark as seen',
                    visibility: 'public'
                });
            postId = createRes.body.post.id;
        });

        it('should mark post as seen successfully', async () => {
            const res = await request(app)
                .post(`/posts/${postId}/seen`)
                .set('Authorization', `Bearer ${testToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /posts/seen', () => {
        it('should get seen posts successfully', async () => {
            const res = await request(app)
                .get('/posts/seen')
                .set('Authorization', `Bearer ${testToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.seenPosts)).toBe(true);
        });
    });
});