const Task = require('../models/task.model');
const Classroom = require('../models/classroom.model');

// Create a new task
const createTask = async (professorId, classroomId, taskData) => {
    try {
        const classroom = await Classroom.findOne({
            _id: classroomId,
            professor: professorId
        });

        if (!classroom) {
            return {
                success: false,
                message: 'Classroom not found or unauthorized'
            };
        }

        const task = await Task.create({
            ...taskData,
            classroom: classroomId,
            professor: professorId
        });

        await task.populate('professor', 'firstName lastName');

        return {
            success: true,
            message: 'Task created successfully',
            data: task
        };
    } catch (error) {
        console.error('Task creation error:', error);
        return {
            success: false,
            message: 'Failed to create task'
        };
    }
};

// Get tasks for a classroom
const getClassroomTasks = async (classroomId, userId, role) => {
    try {
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return {
                success: false,
                message: 'Classroom not found'
            };
        }

        let tasks;
        if (role === 'professor') {
            tasks = await Task.find({ classroom: classroomId })
                .populate('professor', 'firstName lastName')
                .populate('submissions.student', 'firstName lastName');
        } else {
            tasks = await Task.find({ 
                classroom: classroomId,
                $or: [
                    { dueDate: { $gte: new Date() } },
                    { 'submissions.student': userId }
                ]
            }).populate('professor', 'firstName lastName');
        }

        return {
            success: true,
            data: tasks
        };
    } catch (error) {
        console.error('Task retrieval error:', error);
        return {
            success: false,
            message: 'Failed to retrieve tasks'
        };
    }
};

// Submit task
const submitTask = async (taskId, studentId, submission) => {
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return {
                success: false,
                message: 'Task not found'
            };
        }

        if (task.dueDate < new Date()) {
            return {
                success: false,
                message: 'Task submission deadline has passed'
            };
        }

        const submissionIndex = task.submissions.findIndex(
            sub => sub.student.toString() === studentId.toString()
        );

        if (submissionIndex >= 0) {
            task.submissions[submissionIndex] = {
                student: studentId,
                content: submission.content,
                submittedAt: Date.now()
            };
        } else {
            task.submissions.push({
                student: studentId,
                content: submission.content,
                submittedAt: Date.now()
            });
        }

        await task.save();

        return {
            success: true,
            message: 'Task submitted successfully',
            data: task
        };
    } catch (error) {
        console.error('Task submission error:', error);
        return {
            success: false,
            message: 'Failed to submit task'
        };
    }
};

// Grade submission
const gradeSubmission = async (taskId, studentId, professorId, grade, feedback) => {
    try {
        const task = await Task.findOne({
            _id: taskId,
            professor: professorId
        });

        if (!task) {
            return {
                success: false,
                message: 'Task not found or unauthorized'
            };
        }

        const submission = task.submissions.find(
            sub => sub.student.toString() === studentId.toString()
        );

        if (!submission) {
            return {
                success: false,
                message: 'Submission not found'
            };
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.gradedAt = Date.now();

        await task.save();

        return {
            success: true,
            message: 'Submission graded successfully',
            data: task
        };
    } catch (error) {
        console.error('Grading error:', error);
        return {
            success: false,
            message: 'Failed to grade submission'
        };
    }
};

module.exports = {
    createTask,
    getClassroomTasks,
    submitTask,
    gradeSubmission
};