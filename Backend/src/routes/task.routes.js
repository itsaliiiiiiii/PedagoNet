const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkProfessorRole } = require('../middleware/role.middleware');
const upload = require('../config/upload');
const {
    createTask,
    getClassroomTasks,
    submitTask,
    gradeSubmission,
    getStudentTasks,
    getTaskSubmissions
} = require('../services/task.service');

// Create a new task (Professor only)
router.post('/:classroomId', authenticateToken, checkProfessorRole, async (req, res) => {
    try {
        const result = await createTask(req.user.id_user, req.params.classroomId, req.body);
        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        console.error('Task creation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get tasks for a classroom
router.get('/:classroomId', authenticateToken, async (req, res) => {
    try {
        const result = await getClassroomTasks(req.params.classroomId, req.user.id_user, req.user.role);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Tasks retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Submit task (Student only)
router.post('/:taskId/submit', authenticateToken, upload.array('files', 5), async (req, res) => {
    try {
        const submissionData = {
            content: req.body.content || '',
            filePath: req.files ? req.files.map(file => file.path) : []
        };
        const result = await submitTask(req.params.taskId, req.user.id_user, submissionData);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Task submission error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Grade submission (Professor only)
router.post('/:taskId/grade/:studentId', authenticateToken, checkProfessorRole, async (req, res) => {
    try {
        const result = await gradeSubmission(
            req.params.taskId,
            req.params.studentId,
            req.user.id_user,
            req.body.grade,
            req.body.feedback
        );
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Grading error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all tasks from enrolled classrooms (Student only)
router.get('/student/tasks', authenticateToken, async (req, res) => {
    try {
        const result = await getStudentTasks(req.user.id_user);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Student tasks retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all submissions for a task (Professor only)
router.get('/:taskId/submissions', authenticateToken, checkProfessorRole, async (req, res) => {
    try {
        const result = await getTaskSubmissions(req.params.taskId, req.user.id_user);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Task submissions retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;