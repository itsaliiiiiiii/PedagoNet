const BaseRepository = require('./base.repository');

class MessageRepository extends BaseRepository {
    async createMessage(senderId, receiverId, content) {
        const query = `
            MATCH (sender:User {id: $senderId}), (receiver:User {id: $receiverId})
            CREATE (m:Message {
                id: randomUUID(),
                content: $content,
                status: 'sent',
                createdAt: datetime()
            })
            CREATE (sender)-[:SENT]->(m)
            CREATE (m)-[:RECEIVED_BY]->(receiver)
            RETURN m, sender, receiver`;

        const records = await this.executeQuery(query, { senderId, receiverId, content });
        return records.length > 0 ? {
            message: records[0].get('m').properties,
            sender: records[0].get('sender').properties,
            receiver: records[0].get('receiver').properties
        } : null;
    }

    async getConversation(userId1, userId2, limit = 50, skip = 0) {
        const query = `
            MATCH (u1:User {id: $userId1}), (u2:User {id: $userId2})
            MATCH (sender)-[:SENT]->(m:Message)-[:RECEIVED_BY]->(receiver)
            WHERE (sender = u1 AND receiver = u2) OR (sender = u2 AND receiver = u1)
            RETURN m, sender, receiver
            ORDER BY m.createdAt DESC
            SKIP $skip
            LIMIT $limit`;

        const records = await this.executeQuery(query, { userId1, userId2, skip, limit });
        return records.map(record => ({
            message: record.get('m').properties,
            sender: record.get('sender').properties,
            receiver: record.get('receiver').properties
        }));
    }

    async markMessageAsRead(messageId, userId) {
        const query = `
            MATCH (m:Message {id: $messageId})-[:RECEIVED_BY]->(u:User {id: $userId})
            SET m.status = 'read', m.readAt = datetime()
            RETURN m`;

        const records = await this.executeQuery(query, { messageId, userId });
        return records.length > 0 ? records[0].get('m').properties : null;
    }

    async getUnreadCount(userId) {
        const query = `
            MATCH (m:Message {status: 'sent'})-[:RECEIVED_BY]->(u:User {id: $userId})
            RETURN count(m) as unreadCount`;

        const records = await this.executeQuery(query, { userId });
        return records[0].get('unreadCount').toNumber();
    }
}

module.exports = MessageRepository;