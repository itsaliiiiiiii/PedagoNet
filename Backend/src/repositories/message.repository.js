const Message = require('../models/message.model');

class MessageRepository {
    async createMessage(senderId, receiverId, content) {
        try {
            const message = new Message({
                senderId,
                receiverId,
                content,
                status: 'sent',
                createdAt: new Date()
            });
            await message.save();
            return message;
        } catch (error) {
            console.error('Error creating message:', error);
            return null;
        }
    }

    async getConversation(userId1, userId2, limit = 50, skip = 0) {
        try {
            const messages = await Message.find({
                $or: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            return messages;
        } catch (error) {
            console.error('Error getting conversation:', error);
            return [];
        }
    }

    async markMessageAsRead(messageId, userId) {
        try {
            const message = await Message.findOneAndUpdate(
                { _id: messageId, receiverId: userId, status: 'sent' },
                { status: 'read', readAt: new Date() },
                { new: true }
            );
            return message;
        } catch (error) {
            console.error('Error marking message as read:', error);
            return null;
        }
    }

    async getUnreadCount(userId) {
        try {
            const count = await Message.countDocuments({
                receiverId: userId,
                status: 'sent'
            });
            return count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
}

module.exports = MessageRepository;