const Message = require('../models/message.model');
const User = require('../models/user.model');

// Create a new message
const createMessage = async (senderId, receiverId, content) => {
    try {
        // Validate users exist
        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(receiverId)
        ]);

        if (!sender || !receiver) {
            return {
                success: false,
                message: 'Invalid sender or receiver'
            };
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content,
            status: 'sent'
        });

        await message.populate('sender receiver', 'firstName lastName');

        return {
            success: true,
            message: 'Message sent successfully',
            data: message
        };
    } catch (error) {
        console.error('Message creation error:', error);
        return {
            success: false,
            message: 'Failed to send message'
        };
    }
};

// Get conversation history between two users
const getConversation = async (userId1, userId2, limit = 50, skip = 0) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('sender receiver', 'firstName lastName');

        return {
            success: true,
            data: messages
        };
    } catch (error) {
        console.error('Conversation retrieval error:', error);
        return {
            success: false,
            message: 'Failed to retrieve conversation'
        };
    }
};

// Mark message as read
const markMessageAsRead = async (messageId, userId) => {
    try {
        const message = await Message.findById(messageId);

        if (!message) {
            return {
                success: false,
                message: 'Message not found'
            };
        }

        if (message.receiver.toString() !== userId.toString()) {
            return {
                success: false,
                message: 'Not authorized to mark this message as read'
            };
        }

        message.status = 'read';
        message.readAt = Date.now();
        await message.save();

        return {
            success: true,
            message: 'Message marked as read',
            data: message
        };
    } catch (error) {
        console.error('Mark message as read error:', error);
        return {
            success: false,
            message: 'Failed to mark message as read'
        };
    }
};

// Get unread messages count
const getUnreadCount = async (userId) => {
    try {
        const count = await Message.countDocuments({
            receiver: userId,
            status: 'sent'
        });

        return {
            success: true,
            data: { unreadCount: count }
        };
    } catch (error) {
        console.error('Unread count error:', error);
        return {
            success: false,
            message: 'Failed to get unread count'
        };
    }
};

module.exports = {
    createMessage,
    getConversation,
    markMessageAsRead,
    getUnreadCount
};