const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const createTask = async (professorId, classroomId, taskData) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (p:User {id: $professorId}), (c:Classroom {id: $classroomId})
             CREATE (t:Task {
                id: randomUUID(),
                title: $title,
                description: $description,
                deadline: datetime($deadline),
                maxScore: $maxScore,
                createdAt: datetime(),
                updatedAt: datetime()
             })
             CREATE (c)-[:HAS_TASK]->(t)
             CREATE (p)-[:CREATED]->(t)
             RETURN t`,
            {
                professorId,
                classroomId,
                title: taskData.title,
                description: taskData.description,
                deadline: taskData.deadline,
                maxScore: taskData.maxScore
            }
        );

        if (result.records.length === 0) {
            return { success: false, message: 'Failed to create task' };
        }

        const task = result.records[0].get('t').properties;
        return { 
            success: true, 
            message: 'Task created successfully',
            data: task
        };
    } catch (error) {
        console.error('Task creation error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

const getClassroomTasks = async (classroomId, userId, role) => {
    const session = driver.session();
    try {
        let query;
        let params = { classroomId };

        if (role === 'professor') {
            query = `MATCH (c:Classroom {id: $classroomId})-[:HAS_TASK]->(t:Task)
                     OPTIONAL MATCH (t)<-[:SUBMITTED]-(s:Submission)
                     RETURN t, count(s) as submissionCount`;
        } else {
            query = `MATCH (c:Classroom {id: $classroomId})-[:HAS_TASK]->(t:Task)
                     OPTIONAL MATCH (t)<-[:SUBMITTED]-(s:Submission {studentId: $userId})
                     RETURN t, s`;
            params.userId = userId;
        }

        const result = await session.run(query, params);
        
        const tasks = result.records.map(record => {
            const task = record.get('t').properties;
            if (role === 'professor') {
                return {
                    ...task,
                    submissionCount: record.get('submissionCount').toNumber()
                };
            } else {
                const submission = record.get('s') ? record.get('s').properties : null;
                return {
                    ...task,
                    submission
                };
            }
        });

        return { 
            success: true, 
            data: tasks 
        };
    } catch (error) {
        console.error('Tasks retrieval error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

const submitTask = async (taskId, studentId, submissionData) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (t:Task {id: $taskId}), (s:User {id: $studentId})
             CREATE (sub:Submission {
                id: randomUUID(),
                content: $content,
                submittedAt: datetime(),
                status: 'submitted',
                studentId: $studentId
             })
             CREATE (s)-[:SUBMITTED]->(sub)
             CREATE (sub)-[:FOR_TASK]->(t)
             RETURN sub`,
            {
                taskId,
                studentId,
                content: submissionData.content
            }
        );

        if (result.records.length === 0) {
            return { success: false, message: 'Failed to submit task' };
        }

        const submission = result.records[0].get('sub').properties;
        return { 
            success: true, 
            message: 'Task submitted successfully',
            data: submission
        };
    } catch (error) {
        console.error('Task submission error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

const gradeSubmission = async (taskId, studentId, professorId, grade, feedback) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (t:Task {id: $taskId})<-[:FOR_TASK]-(sub:Submission {studentId: $studentId})
             SET sub.grade = $grade,
                 sub.feedback = $feedback,
                 sub.gradedAt = datetime(),
                 sub.status = 'graded',
                 sub.gradedBy = $professorId
             RETURN sub`,
            {
                taskId,
                studentId,
                professorId,
                grade,
                feedback
            }
        );

        if (result.records.length === 0) {
            return { success: false, message: 'Submission not found' };
        }

        const submission = result.records[0].get('sub').properties;
        return { 
            success: true, 
            message: 'Submission graded successfully',
            data: submission
        };
    } catch (error) {
        console.error('Grading error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

module.exports = {
    createTask,
    getClassroomTasks,
    submitTask,
    gradeSubmission
};