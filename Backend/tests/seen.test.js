const request = require('supertest');
const express = require('express');
const seenRoutes = require('../src/routes/seen.routes');
const { generateTestToken, createTestUser } = require('./setup');

const app = express();
app.use(express.json());
app.use('/seen', seenRoutes);

describe('Seen Routes', () => {
    let testUser;
    let testToken;
    let testPost;

    beforeAll(async () => {
        testUser = await createTestUser();
        testToken = generateTestToken(testUser.id_user);
        
        // Create a test post
        const session = neo4j.driver.session();
        const result = await session.run(`
            CREATE (p:Post {
                id_post: randomUUID(),
                content: 'Test post',
                visibility: 'public',
                createdAt: datetime()
            })
            RETURN p
        `);
        testPost = result.records[0].get('p').properties;
        await session.close();
    });

    describe('POST /seen/:postId', () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .post(`/seen/${testPost.id_post}`)
                .send({});
            
            expect(res.status).toBe(401);
        });

        it('should mark post as seen successfully', async () => {
            const res = await request(app)
                .post(`/seen/${testPost.id_post}`)
                .set('Authorization', `Bearer ${testToken}`)
                .send({});
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Post marked as seen');
        });

        it('should return 500 if post does not exist', async () => {
            const res = await request(app)
                .post('/seen/nonexistentId')
                .set('Authorization', `Bearer ${testToken}`)
                .send({});
            
            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Failed to mark post as seen');
        });
    });

    describe('GET /seen', () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/seen');
            expect(res.status).toBe(401);
        });

        it('should get all seen posts successfully', async () => {
            const res = await request(app)
                .get('/seen')
                .set('Authorization', `Bearer ${testToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.seenPosts)).toBe(true);
            expect(res.body.seenPosts).toContainEqual(
                expect.objectContaining({
                    id_post: testPost.id_post
                })
            );
        });
    });
});