const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        // ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    likes: [{
        type: String,
        // ref: 'User'
    }]
});

const commentSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        ref: 'Post'
    },
    userId: {
        type: String,
        required: true,
        // ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    likes: [{
        type: String,
        // ref: 'User'
    }],
    replies: [replySchema]
});

// Update timestamps on save
commentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update timestamps on replies
commentSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;