const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const taskRepository = require('../repositories/task.repository');

const createTask = async (professorId, classroomId, taskData) => {
    try {
        const task = await taskRepository.createTask(professorId, classroomId, taskData);
        return task ? {
            success: true,
            message: 'Task created successfully',
            data: task
        } : {
            success: false,
            message: 'Failed to create task'
        };
    } catch (error) {
        console.error('Task creation error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const getClassroomTasks = async (classroomId, userId, role) => {
    try {
        const records = await taskRepository.getClassroomTasks(classroomId, userId, role);
        const tasks = records.map(record => {
            const task = record.get('t').properties;
            if (role === 'professor') {
                return {
                    ...task,
                    submissionCount: record.get('submissionCount').toNumber()
                };
            } else {
                const submission = record.get('sub') ? record.get('sub').properties : null;
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
    }
};

// Add new function to get all tasks from enrolled classrooms
const getStudentTasks = async (studentId) => {
    const session = driver.session();
    try {
        const query = `
            MATCH (s:User {id_user: $studentId})-[:ENROLLED_IN]->(c:Classroom)
            MATCH (c)-[:HAS_TASK]->(t:Task)
            OPTIONAL MATCH (t)<-[:SUBMITTED]-(sub:Submission {student_id: $studentId})
            WITH c, t, sub,
                 CASE 
                     WHEN sub IS NULL THEN 'not_submitted'
                     WHEN sub.status = 'submitted' THEN 'pending_review'
                     ELSE sub.status
                 END as submissionStatus
            RETURN c, t, sub, submissionStatus
            ORDER BY t.deadline`;

        const result = await session.run(query, { studentId });

        const tasks = result.records.map(record => {
            const classroom = record.get('c').properties;
            const task = record.get('t').properties;
            const submission = record.get('sub') ? record.get('sub').properties : null;
            const status = record.get('submissionStatus');

            return {
                ...task,
                classroom: {
                    id_classroom: classroom.id_classroom,
                    name: classroom.name
                },
                submission,
                status
            };
        });

        return {
            success: true,
            data: tasks
        };
    } catch (error) {
        console.error('Student tasks retrieval error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

const submitTask = async (taskId, studentId, submissionData) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (t:Task {id_task: $taskId}), (s:User {id_user: $studentId})
             CREATE (sub:Submission {
                id_submission: randomUUID(),
                content: $content,
                filePath: $filePath,
                submittedAt: datetime(),
                status: 'submitted',
                student_id: $studentId
             })
             CREATE (s)-[:SUBMITTED]->(sub)
             CREATE (sub)-[:FOR_TASK]->(t)
             RETURN sub`,
            {
                taskId,
                studentId,
                content: submissionData.content,
                filePath: submissionData.filePath
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
            `MATCH (t:Task {id_task: $taskId})<-[:FOR_TASK]-(sub:Submission {student_id: $studentId})
             SET sub.grade = $grade,
                 sub.feedback = $feedback,
                 sub.gradedAt = datetime(),
                 sub.status = 'graded',
                 sub.graded_by = $professorId
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

const getTaskSubmissions = async (taskId, professorId) => {
    const session = driver.session();
    try {
        const query = `
            MATCH (p:User {id_user: $professorId})-[:TEACHES]->(c:Classroom)-[:HAS_TASK]->(t:Task {id_task: $taskId})
            OPTIONAL MATCH (t)<-[:FOR_TASK]-(sub:Submission)<-[:SUBMITTED]-(s:User)
            WITH t, collect({
                submission: sub,
                student: CASE 
                    WHEN s IS NOT NULL 
                    THEN {id_user: s.id_user, firstName: s.firstName, lastName: s.lastName}
                    ELSE NULL 
                END
            }) as submissions
            RETURN {
                task: properties(t),
                submissions: [x IN submissions WHERE x.submission IS NOT NULL]
            } as result`;

        const result = await session.run(query, { taskId, professorId });
        
        if (result.records.length === 0) {
            return {
                success: false,
                message: 'Task not found or unauthorized access'
            };
        }

        const data = result.records[0].get('result');
        return {
            success: true,
            data: {
                task: data.task,
                submissions: data.submissions.map(sub => ({
                    ...sub.submission.properties,
                    student: sub.student
                }))
            }
        };
    } catch (error) {
        console.error('Task submissions retrieval error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        await session.close();
    }
};

module.exports = {
    createTask,
    getClassroomTasks,
    submitTask,
    gradeSubmission,
    getStudentTasks,
    getTaskSubmissions
};