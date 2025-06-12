const ClassroomRepository = require('../repositories/classroom.repository');
const classroomRepository = new ClassroomRepository();

const createClassroom = async (professorId, classroomData) => {
    try {
        const classroom = await classroomRepository.createClassroom(professorId, classroomData);
        if (!classroom) {
            return { success: false, message: 'Failed to create classroom' };
        }
        return { success: true, classroom };
    } catch (error) {
        console.error('Classroom creation error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const enrollStudentByCode = async (studentId, code) => {
    try {
        const result = await classroomRepository.enrollStudentByCode(studentId, code);
        if (!result) {
            return { success: false, message: 'Invalid classroom code' };
        }
        if (result === 'already_enrolled') {
            return { success: false, message: 'You are already enrolled in this classroom' };
        }
        return {
            success: true,
            message: 'Successfully enrolled in classroom',
            classroom: result.classroom
        };
    } catch (error) {
        console.error('Student enrollment error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const unenrollStudent = async (classroomId, studentId) => {
    try {
        const deletedCount = await classroomRepository.unenrollStudent(classroomId, studentId);
        if (deletedCount === 0) {
            return { success: false, message: 'Student is not enrolled in this classroom' };
        }
        return { success: true, message: 'Student unenrolled successfully' };
    } catch (error) {
        console.error('Student unenrollment error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const getEnrolledStudents = async (classroomId, userId) => {
    try {
        const students = await classroomRepository.getEnrolledStudents(classroomId, userId);
        if (!students) {
            return { success: false, message: 'Access denied or classroom not found' };
        }
        return { success: true, students };
    } catch (error) {
        console.error('Enrolled students retrieval error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const getClassroomDetails = async (classroomId) => {
    try {
        const result = await classroomRepository.getClassroomDetails(classroomId);
        if (!result) {
            return { success: false, message: 'Classroom not found' };
        }

        return {
            success: true,
            classroom: {
                ...result.classroom,
                professors: result.professors,
                students: result.students
            }
        };
    } catch (error) {
        console.error('Classroom details error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const getStudentClassrooms = async (studentId) => {
    try {
        const classrooms = await classroomRepository.getStudentClassrooms(studentId);
        return { success: true, classrooms };
    } catch (error) {
        console.error('Student classrooms error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const getProfessorClassrooms = async (professorId) => {
    try {
        const classrooms = await classroomRepository.getProfessorClassrooms(professorId);
        return { success: true, classrooms };
    } catch (error) {
        console.error('Professor classrooms error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const getAllClassrooms = async (userId, role) => {
    try {
        const classrooms = await classroomRepository.getAllClassrooms(userId, role);
        return {
            success: true,
            classrooms: classrooms
        };
    } catch (error) {
        console.error('Classrooms retrieval error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const updateClassroom = async (classroomId, professorId, updateData) => {
    try {
        const updatedClassroom = await classroomRepository.updateClassroom(classroomId, professorId, updateData);
        if (!updatedClassroom) {
            return {
                success: false,
                message: 'Classroom not found or you do not have permission to update it'
            };
        }

        return {
            success: true,
            message: 'Classroom updated successfully',
            classroom: updatedClassroom
        };
    } catch (error) {
        console.error('Classroom update error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const deleteClassroom = async (classroomId, professorId) => {
    try {
        const deletedCount = await classroomRepository.deleteClassroom(classroomId, professorId);
        if (deletedCount === null) {
            return {
                success: false,
                message: 'Classroom not found or you do not have permission to delete it'
            };
        }

        return {
            success: deletedCount > 0,
            message: deletedCount > 0 ? 'Classroom and associated tasks deleted successfully' : 'Failed to delete classroom'
        };
    } catch (error) {
        console.error('Classroom deletion error:', error);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    createClassroom,
    getClassroomDetails,
    getStudentClassrooms,
    getProfessorClassrooms,
    getAllClassrooms,
    updateClassroom,
    deleteClassroom, getEnrolledStudents
    , unenrollStudent, enrollStudentByCode

};