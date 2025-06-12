const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkProfessorRole } = require('../middleware/role.middleware');
const { 
    createClassroom,
    getClassroomDetails,
    getAllClassrooms,
    updateClassroom,
    deleteClassroom,
    unenrollStudent,
    enrollStudentByCode,
    getEnrolledStudents
} = require('../services/classroom.service');

// Create a new classroom (Professor only)
router.post('/', authenticateToken, checkProfessorRole, async (req, res) => {
    try {
        console.log(req.body);
        const result = await createClassroom(req.user.id_user, req.body);
        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        console.error('Classroom creation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get a specific classroom
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await getClassroomDetails(req.params.id, req.user._id);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        console.error('Classroom retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all classrooms (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await getAllClassrooms(req.user.id_user, req.user.role);
        res.status(200).json(result);
    } catch (error) {
        console.error('Classrooms retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update classroom (Professor only)
router.put('/:id', authenticateToken, checkProfessorRole, async (req, res) => {
    try {
        const result = await updateClassroom(req.params.id, req.user.id_user, req.body);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Classroom update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete classroom (Professor only)
router.delete('/:id', authenticateToken, checkProfessorRole, async (req, res) => {
    try {
        const result = await deleteClassroom(req.params.id, req.user.id_user);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Classroom deletion error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Enroll student in classroom using code
router.post('/enroll', authenticateToken, async (req, res) => {
    try {
        const result = await enrollStudentByCode(req.user.id_user, req.body.code);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Student enrollment error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Unenroll student from classroom
router.post('/:id/unenroll', authenticateToken, async (req, res) => {
    try {
        const result = await unenrollStudent(req.params.id, req.user.id_user);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Student unenrollment error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get enrolled students in a classroom
router.get('/:id/students', authenticateToken, async (req, res) => {
    try {
        const result = await getEnrolledStudents(req.params.id, req.user.id_user);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Enrolled students retrieval error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;