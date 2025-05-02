const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['sent', 'read'], default: 'sent' },
    readAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for faster querying
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ status: 1, receiverId: 1 });

module.exports = mongoose.model('Message', messageSchema);