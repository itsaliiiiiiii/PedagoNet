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
            `MATCH (p:User {id_user: $professorId, role: 'professor'})
             CREATE (c:Classroom {
                id_classroom: randomUUID(),
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
            `MATCH (c:Classroom {id_classroom: $classroomId}), (s:User {id_user: $studentId, role: 'student'})
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
            `MATCH (c:Classroom {id_classroom: $classroomId})
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
            `MATCH (s:User {id_user: $studentId})-[:ENROLLED_IN]->(c:Classroom)
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
            `MATCH (p:User {id_user: $professorId})-[:TEACHES]->(c:Classroom)
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

const getAllClassrooms = async (userId, role) => {
    const session = driver.session();
    try {
        let query;
        if (role === 'professor') {
            query = `
                MATCH (p:User {id_user: $userId})-[:TEACHES]->(c:Classroom)
                RETURN collect({
                    id_classroom: c.id_classroom,
                    name: c.name,
                    description: c.description,
                    code: c.code,
                    isActive: c.isActive
                }) as classrooms
            `;
        } else {
            query = `
                MATCH (s:User {id_user: $userId})-[:ENROLLED_IN]->(c:Classroom)
                RETURN collect({
                    id_classroom: c.id_classroom,
                    name: c.name,
                    description: c.description
                }) as classrooms
            `;
        }

        const result = await session.run(query, { userId });
        const classrooms = result.records[0].get('classrooms');
        
        return {
            success: true,
            classrooms: classrooms
        };
    } catch (error) {
        console.error('Classrooms retrieval error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

const updateClassroom = async (classroomId, professorId, updateData) => {
    const session = driver.session();
    try {
        // First verify the professor owns this classroom
        const verifyResult = await session.run(
            `MATCH (p:User {id_user: $professorId})-[:TEACHES]->(c:Classroom {id_classroom: $classroomId})
             RETURN c`,
            { professorId, classroomId }
        );

        if (verifyResult.records.length === 0) {
            return { 
                success: false, 
                message: 'Classroom not found or you do not have permission to update it' 
            };
        }

        // Build update query
        const updates = [];
        const params = { classroomId, professorId };

        // Only allow updating specific fields
        const allowedUpdates = ['name', 'description', 'isActive'];
        Object.entries(updateData).forEach(([key, value]) => {
            if (allowedUpdates.includes(key)) {
                updates.push(`c.${key} = $${key}`);
                params[key] = value;
            }
        });

        // Add timestamp
        updates.push('c.updatedAt = datetime()');

        const result = await session.run(
            `MATCH (c:Classroom {id_classroom: $classroomId})
             SET ${updates.join(', ')}
             RETURN c`,
            params
        );

        const updatedClassroom = result.records[0].get('c').properties;
        return { 
            success: true, 
            message: 'Classroom updated successfully',
            classroom: updatedClassroom 
        };
    } catch (error) {
        console.error('Classroom update error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

const deleteClassroom = async (classroomId, professorId) => {
    const session = driver.session();
    try {
        // First verify the professor owns this classroom
        const verifyResult = await session.run(
            `MATCH (p:User {id_user: $professorId})-[:TEACHES]->(c:Classroom {id_classroom: $classroomId})
             RETURN c`,
            { professorId, classroomId }
        );

        if (verifyResult.records.length === 0) {
            return { 
                success: false, 
                message: 'Classroom not found or you do not have permission to delete it' 
            };
        }

        // Delete all tasks, their relationships, and the classroom
        const result = await session.run(
            `MATCH (c:Classroom {id_classroom: $classroomId})
             OPTIONAL MATCH (c)-[:HAS_TASK]->(t:Task)
             OPTIONAL MATCH (t)-[tr]-()  // Get all task relationships
             OPTIONAL MATCH (c)-[cr]-()  // Get all classroom relationships
             DELETE tr, t, cr, c
             RETURN count(c) as deleted`,
            { classroomId }
        );

        const deletedCount = result.records[0].get('deleted').toNumber();
        
        return { 
            success: deletedCount > 0, 
            message: deletedCount > 0 ? 'Classroom and associated tasks deleted successfully' : 'Failed to delete classroom'
        };
    } catch (error) {
        console.error('Classroom deletion error:', error);
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
    getProfessorClassrooms,
    getAllClassrooms,
    updateClassroom,
    deleteClassroom  // Add this to exports
};