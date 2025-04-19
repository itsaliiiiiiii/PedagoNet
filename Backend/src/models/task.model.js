const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    attachments: [{
        filename: String,
        url: String,
        mimetype: String
    }],
    maxPoints: {
        type: Number,
        required: true,
        min: 0
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        files: [{
            filename: String,
            url: String,
            mimetype: String
        }],
        grade: {
            points: {
                type: Number,
                min: 0
            },
            feedback: String,
            gradedAt: Date
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;