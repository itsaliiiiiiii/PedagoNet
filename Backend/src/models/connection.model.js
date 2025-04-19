const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
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

// Ensure unique connections between users
connectionSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// Prevent self-connections
connectionSchema.pre('save', function(next) {
    if (this.sender.toString() === this.receiver.toString()) {
        next(new Error('Cannot create connection with self'));
    }
    next();
});

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;