const checkProfessorRole = (req, res, next) => {
    if (req.user.role !== 'professor') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Professor role required.'
        });
    }
    next();
};

const checkStudentRole = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Student role required.'
        });
    }
    next();
};

module.exports = {
    checkProfessorRole,
    checkStudentRole
};