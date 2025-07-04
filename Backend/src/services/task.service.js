const taskRepository = require('../repositories/task.repository');

const createTask = async (professorId, classroomId, taskData) => {
    try {
        // Validate attachments if present
        if (taskData.attachments && !Array.isArray(taskData.attachments)) {
            return { success: false, message: 'Attachments must be an array' };
        }

        const task = await taskRepository.createTask(professorId, classroomId, taskData);
        if (!task) {
            return { success: false, message: 'Failed to create task' };
        }
        return {
            success: true,
            message: 'Task created successfully',
            data: task
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
            const attachments = record.get('attachments');
            
            if (role === 'professor') {
                return {
                    ...task,
                    attachments,
                    submissionCount: record.get('submissionCount').toNumber()
                };
            } else {
                const submission = record.get('t') ? record.get('t').properties : null;
                
                return {
                    ...task,
                    attachments,
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

const getStudentTasks = async (studentId) => {
    try {
        const records = await taskRepository.getStudentTasks(studentId);
        const tasks = records.map(record => {
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
    }
};

const submitTask = async (taskId, studentId, submissionData) => {
    try {
        // Validate attachments if present
        if (submissionData.attachments && !Array.isArray(submissionData.attachments)) {
            return { success: false, message: 'Attachments must be an array' };
        }

        const submission = await taskRepository.submitTask(taskId, studentId, submissionData);
        if (!submission) {
            return { success: false, message: 'Failed to submit task' };
        }
        return {
            success: true,
            message: 'Task submitted successfully',
            data: submission
        };
    } catch (error) {
        console.error('Task submission error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const gradeSubmission = async (taskId, studentId, professorId, grade, feedback) => {
    try {
        const submission = await taskRepository.gradeSubmission(taskId, studentId, professorId, grade, feedback);
        if (!submission) {
            return { success: false, message: 'Submission not found' };
        }
        return {
            success: true,
            message: 'Submission graded successfully',
            data: submission
        };
    } catch (error) {
        console.error('Grading error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    createTask,
    getClassroomTasks,
    submitTask,
    gradeSubmission,
    getStudentTasks
};