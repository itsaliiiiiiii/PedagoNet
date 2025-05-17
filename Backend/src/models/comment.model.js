const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
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
    likes: [String] // Array of user IDs
});

const commentSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true
    },
    comments: [{
        userId: {
            type: String,
            required: true
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
        likes: [String], // Array of user IDs
        replies: [replySchema]
    }]
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;