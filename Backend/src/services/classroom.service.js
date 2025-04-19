const Classroom = require('../models/classroom.model');
const User = require('../models/user.model');

// Create a new classroom
const createClassroom = async (professorId, classroomData) => {
    try {
        const classroom = await Classroom.create({
            ...classroomData,
            professor: professorId
        });

        await classroom.populate('professor', 'firstName lastName');

        return {
            success: true,
            message: 'Classroom created successfully',
            data: classroom
        };
    } catch (error) {
        console.error('Classroom creation error:', error);
        return {
            success: false,
            message: 'Failed to create classroom'
        };
    }
};

// Get classroom by ID
const getClassroomById = async (classroomId, userId) => {
    try {
        const classroom = await Classroom.findById(classroomId)
            .populate('professor', 'firstName lastName')
            .populate('enrolledStudents', 'firstName lastName');

        if (!classroom) {
            return {
                success: false,
                message: 'Classroom not found'
            };
        }

        // Check if user has access to the classroom
        const isEnrolled = classroom.enrolledStudents.some(student => 
            student._id.toString() === userId.toString()
        );
        const isProfessor = classroom.professor._id.toString() === userId.toString();

        if (!isEnrolled && !isProfessor) {
            return {
                success: false,
                message: 'Not authorized to access this classroom'
            };
        }

        return {
            success: true,
            data: classroom
        };
    } catch (error) {
        console.error('Classroom retrieval error:', error);
        return {
            success: false,
            message: 'Failed to retrieve classroom'
        };
    }
};

// Get all classrooms (filtered by role)
const getAllClassrooms = async (userId, role) => {
    try {
        let classrooms;
        if (role === 'professor') {
            classrooms = await Classroom.find({ professor: userId })
                .populate('professor', 'firstName lastName')
                .populate('enrolledStudents', 'firstName lastName');
        } else {
            classrooms = await Classroom.find({ enrolledStudents: userId })
                .populate('professor', 'firstName lastName');
        }

        return {
            success: true,
            data: classrooms
        };
    } catch (error) {
        console.error('Classrooms retrieval error:', error);
        return {
            success: false,
            message: 'Failed to retrieve classrooms'
        };
    }
};

// Update classroom
const updateClassroom = async (classroomId, professorId, updates) => {
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

        Object.assign(classroom, updates);
        await classroom.save();
        await classroom.populate('professor', 'firstName lastName');

        return {
            success: true,
            message: 'Classroom updated successfully',
            data: classroom
        };
    } catch (error) {
        console.error('Classroom update error:', error);
        return {
            success: false,
            message: 'Failed to update classroom'
        };
    }
};

// Delete classroom
const deleteClassroom = async (classroomId, professorId) => {
    try {
        const classroom = await Classroom.findOneAndDelete({
            _id: classroomId,
            professor: professorId
        });

        if (!classroom) {
            return {
                success: false,
                message: 'Classroom not found or unauthorized'
            };
        }

        return {
            success: true,
            message: 'Classroom deleted successfully'
        };
    } catch (error) {
        console.error('Classroom deletion error:', error);
        return {
            success: false,
            message: 'Failed to delete classroom'
        };
    }
};

// Enroll student in classroom
const enrollStudent = async (classroomId, studentId, code) => {
    try {
        const classroom = await Classroom.findOne({ _id: classroomId, code });

        if (!classroom) {
            return {
                success: false,
                message: 'Invalid classroom or enrollment code'
            };
        }

        if (classroom.enrolledStudents.includes(studentId)) {
            return {
                success: false,
                message: 'Student already enrolled in this classroom'
            };
        }

        classroom.enrolledStudents.push(studentId);
        await classroom.save();
        await classroom.populate('professor', 'firstName lastName');

        return {
            success: true,
            message: 'Enrolled successfully',
            data: classroom
        };
    } catch (error) {
        console.error('Student enrollment error:', error);
        return {
            success: false,
            message: 'Failed to enroll student'
        };
    }
};

// Unenroll student from classroom
const unenrollStudent = async (classroomId, studentId) => {
    try {
        const classroom = await Classroom.findById(classroomId);

        if (!classroom) {
            return {
                success: false,
                message: 'Classroom not found'
            };
        }

        const studentIndex = classroom.enrolledStudents.indexOf(studentId);
        if (studentIndex === -1) {
            return {
                success: false,
                message: 'Student not enrolled in this classroom'
            };
        }

        classroom.enrolledStudents.splice(studentIndex, 1);
        await classroom.save();

        return {
            success: true,
            message: 'Unenrolled successfully'
        };
    } catch (error) {
        console.error('Student unenrollment error:', error);
        return {
            success: false,
            message: 'Failed to unenroll student'
        };
    }
};

// Get enrolled students
const getEnrolledStudents = async (classroomId, professorId) => {
    try {
        const classroom = await Classroom.findOne({
            _id: classroomId,
            professor: professorId
        }).populate('enrolledStudents', 'firstName lastName email');

        if (!classroom) {
            return {
                success: false,
                message: 'Classroom not found or unauthorized'
            };
        }

        return {
            success: true,
            data: classroom.enrolledStudents
        };
    } catch (error) {
        console.error('Enrolled students retrieval error:', error);
        return {
            success: false,
            message: 'Failed to retrieve enrolled students'
        };
    }
};

module.exports = {
    createClassroom,
    getClassroomById,
    getAllClassrooms,
    updateClassroom,
    deleteClassroom,
    enrollStudent,
    unenrollStudent,
    getEnrolledStudents
};