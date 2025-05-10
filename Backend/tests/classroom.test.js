const request = require('supertest');
const express = require('express');
const classroomRoutes = require('../src/routes/classroom.routes');
const { generateTestToken, createTestUser } = require('./setup');

const app = express();
app.use(express.json());
app.use('/classrooms', classroomRoutes);

describe('Classroom Routes', () => {
    let professorUser;
    let professorToken;
    let studentUser;
    let studentToken;
    let classroomId;

    beforeAll(async () => {
        professorUser = await createTestUser();
        professorToken = generateTestToken(professorUser.id_user, 'professor');
        studentUser = await createTestUser();
        studentToken = generateTestToken(studentUser.id_user, 'student');
    });

    describe('POST /classrooms', () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .post('/classrooms')
                .send({
                    name: 'Test Classroom',
                    description: 'Test Description'
                });
            
            expect(res.status).toBe(401);
        });

        it('should return 403 if not a professor', async () => {
            const res = await request(app)
                .post('/classrooms')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    name: 'Test Classroom',
                    description: 'Test Description'
                });
            
            expect(res.status).toBe(403);
        });

        it('should create classroom successfully', async () => {
            const res = await request(app)
                .post('/classrooms')
                .set('Authorization', `Bearer ${professorToken}`)
                .send({
                    name: 'Test Classroom',
                    description: 'Test Description'
                });
            
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.classroom).toBeDefined();
            classroomId = res.body.classroom.id;
        });
    });

    describe('GET /classrooms', () => {
        it('should get all classrooms for professor', async () => {
            const res = await request(app)
                .get('/classrooms')
                .set('Authorization', `Bearer ${professorToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.classrooms)).toBe(true);
        });

        it('should get enrolled classrooms for student', async () => {
            const res = await request(app)
                .get('/classrooms')
                .set('Authorization', `Bearer ${studentToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.classrooms)).toBe(true);
        });
    });

    describe('POST /classrooms/:id/enroll', () => {
        it('should enroll student successfully', async () => {
            const res = await request(app)
                .post(`/classrooms/${classroomId}/enroll`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ code: 'testcode' });
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 400 with invalid enrollment code', async () => {
            const res = await request(app)
                .post(`/classrooms/${classroomId}/enroll`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ code: 'wrongcode' });
            
            expect(res.status).toBe(400);
        });
    });

    describe('GET /classrooms/:id/students', () => {
        it('should get enrolled students', async () => {
            const res = await request(app)
                .get(`/classrooms/${classroomId}/students`)
                .set('Authorization', `Bearer ${professorToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.students)).toBe(true);
        });
    });

    describe('DELETE /classrooms/:id', () => {
        it('should delete classroom successfully', async () => {
            const res = await request(app)
                .delete(`/classrooms/${classroomId}`)
                .set('Authorization', `Bearer ${professorToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 403 if not classroom owner', async () => {
            const anotherProfessorToken = generateTestToken('anotherProfessorId', 'professor');
            const res = await request(app)
                .delete(`/classrooms/${classroomId}`)
                .set('Authorization', `Bearer ${anotherProfessorToken}`);
            
            expect(res.status).toBe(400);
        });
    });
});