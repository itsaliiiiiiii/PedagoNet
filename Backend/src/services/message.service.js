const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

// Create a new message
const createMessage = async (senderId, receiverId, content) => {
    const session = driver.session();
    try {
        // Validate users exist
        const result = await session.run(
            `MATCH (sender:User {id: $senderId}), (receiver:User {id: $receiverId})
             CREATE (m:Message {
                id: randomUUID(),
                content: $content,
                status: 'sent',
                createdAt: datetime()
             })
             CREATE (sender)-[:SENT]->(m)
             CREATE (m)-[:RECEIVED_BY]->(receiver)
             RETURN m, sender, receiver`,
            { senderId, receiverId, content }
        );

        if (result.records.length === 0) {
            return {
                success: false,
                message: 'Invalid sender or receiver'
            };
        }

        const messageData = result.records[0].get('m').properties;
        const senderData = result.records[0].get('sender').properties;
        const receiverData = result.records[0].get('receiver').properties;

        return {
            success: true,
            message: 'Message sent successfully',
            data: {
                ...messageData,
                sender: { firstName: senderData.firstName, lastName: senderData.lastName },
                receiver: { firstName: receiverData.firstName, lastName: receiverData.lastName }
            }
        };
    } catch (error) {
        console.error('Message creation error:', error);
        return {
            success: false,
            message: 'Failed to send message'
        };
    } finally {
        await session.close();
    }
};

// Get conversation history between two users
const getConversation = async (userId1, userId2, limit = 50, skip = 0) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (u1:User {id: $userId1}), (u2:User {id: $userId2})
             MATCH (sender)-[:SENT]->(m:Message)-[:RECEIVED_BY]->(receiver)
             WHERE (sender = u1 AND receiver = u2) OR (sender = u2 AND receiver = u1)
             RETURN m, sender, receiver
             ORDER BY m.createdAt DESC
             SKIP $skip
             LIMIT $limit`,
            { userId1, userId2, skip: neo4j.int(skip), limit: neo4j.int(limit) }
        );

        const messages = result.records.map(record => {
            const message = record.get('m').properties;
            const sender = record.get('sender').properties;
            const receiver = record.get('receiver').properties;
            return {
                ...message,
                sender: { id: sender.id, firstName: sender.firstName, lastName: sender.lastName },
                receiver: { id: receiver.id, firstName: receiver.firstName, lastName: receiver.lastName }
            };
        });

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
    } finally {
        await session.close();
    }
};

// Mark message as read
const markMessageAsRead = async (messageId, userId) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (m:Message {id: $messageId})-[:RECEIVED_BY]->(u:User {id: $userId})
             SET m.status = 'read', m.readAt = datetime()
             RETURN m`,
            { messageId, userId }
        );

        if (result.records.length === 0) {
            return {
                success: false,
                message: 'Message not found or not authorized'
            };
        }

        return {
            success: true,
            message: 'Message marked as read',
            data: result.records[0].get('m').properties
        };
    } catch (error) {
        console.error('Mark message as read error:', error);
        return {
            success: false,
            message: 'Failed to mark message as read'
        };
    } finally {
        await session.close();
    }
};

// Get unread messages count
const getUnreadCount = async (userId) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (m:Message {status: 'sent'})-[:RECEIVED_BY]->(u:User {id: $userId})
             RETURN count(m) as unreadCount`,
            { userId }
        );

        const unreadCount = result.records[0].get('unreadCount').toNumber();

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
    } finally {
        await session.close();
    }
};

module.exports = {
    createMessage,
    getConversation,
    markMessageAsRead,
    getUnreadCount
};