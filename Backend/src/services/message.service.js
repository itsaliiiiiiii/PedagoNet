const MessageRepository = require('../repositories/message.repository');
const messageRepository = new MessageRepository();

// Create a new message
const createMessage = async (senderId, receiverId, content) => {
    try {
        const result = await messageRepository.createMessage(senderId, receiverId, content);
        if (!result) {
            return {
                success: false,
                message: 'Invalid sender or receiver'
            };
        }

        return {
            success: true,
            message: 'Message sent successfully',
            data: {
                ...result.message,
                sender: { firstName: result.sender.firstName, lastName: result.sender.lastName },
                receiver: { firstName: result.receiver.firstName, lastName: result.receiver.lastName }
            }
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
        const messages = await messageRepository.getConversation(userId1, userId2, limit, skip);
        return {
            success: true,
            data: messages.map(msg => ({
                ...msg.message,
                sender: { id: msg.sender.id, firstName: msg.sender.firstName, lastName: msg.sender.lastName },
                receiver: { id: msg.receiver.id, firstName: msg.receiver.firstName, lastName: msg.receiver.lastName }
            }))
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
        const message = await messageRepository.markMessageAsRead(messageId, userId);
        if (!message) {
            return {
                success: false,
                message: 'Message not found or not authorized'
            };
        }

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
        const unreadCount = await messageRepository.getUnreadCount(userId);
        return {
            success: true,
            data: { unreadCount }
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