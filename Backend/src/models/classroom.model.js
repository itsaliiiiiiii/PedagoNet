const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    professor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    code: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate a unique classroom code
classroomSchema.pre('save', async function(next) {
    if (!this.isModified('code')) {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.code = code;
    }
    next();
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;