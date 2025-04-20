const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const createClassroom = async (professorId, classroomData) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (p:User {id: $professorId, role: 'professor'})
             CREATE (c:Classroom {
                id: randomUUID(),
                name: $name,
                description: $description,
                code: $code,
                isActive: $isActive,
                createdAt: datetime(),
                updatedAt: datetime()
             })
             CREATE (p)-[:TEACHES]->(c)
             RETURN c`,
            {
                professorId,
                name: classroomData.name,
                description: classroomData.description,
                code: classroomData.code,
                isActive: classroomData.isActive || true
            }
        );

        if (result.records.length === 0) {
            return { success: false, message: 'Failed to create classroom' };
        }

        const classroom = result.records[0].get('c').properties;
        return { success: true, classroom };
    } catch (error) {
        console.error('Classroom creation error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

const enrollStudent = async (classroomId, studentId) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (c:Classroom {id: $classroomId}), (s:User {id: $studentId, role: 'student'})
             CREATE (s)-[:ENROLLED_IN]->(c)
             RETURN c, s`,
            { classroomId, studentId }
        );

        if (result.records.length === 0) {
            return { success: false, message: 'Failed to enroll student' };
        }

        return { success: true, message: 'Student enrolled successfully' };
    } catch (error) {
        console.error('Student enrollment error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

const getClassroomDetails = async (classroomId) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (c:Classroom {id: $classroomId})
             OPTIONAL MATCH (p:User)-[:TEACHES]->(c)
             OPTIONAL MATCH (s:User)-[:ENROLLED_IN]->(c)
             RETURN c, collect(DISTINCT p) as professors, collect(DISTINCT s) as students`,
            { classroomId }
        );

        if (result.records.length === 0) {
            return { success: false, message: 'Classroom not found' };
        }

        const classroom = result.records[0].get('c').properties;
        const professors = result.records[0].get('professors').map(p => p.properties);
        const students = result.records[0].get('students').map(s => s.properties);

        return {
            success: true,
            classroom: {
                ...classroom,
                professors,
                students
            }
        };
    } catch (error) {
        console.error('Classroom details error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

const getStudentClassrooms = async (studentId) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (s:User {id: $studentId})-[:ENROLLED_IN]->(c:Classroom)
             RETURN collect(c) as classrooms`,
            { studentId }
        );

        const classrooms = result.records[0].get('classrooms').map(c => c.properties);
        return { success: true, classrooms };
    } catch (error) {
        console.error('Student classrooms error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

const getProfessorClassrooms = async (professorId) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (p:User {id: $professorId})-[:TEACHES]->(c:Classroom)
             RETURN collect(c) as classrooms`,
            { professorId }
        );

        const classrooms = result.records[0].get('classrooms').map(c => c.properties);
        return { success: true, classrooms };
    } catch (error) {
        console.error('Professor classrooms error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

module.exports = {
    createClassroom,
    enrollStudent,
    getClassroomDetails,
    getStudentClassrooms,
    getProfessorClassrooms
};