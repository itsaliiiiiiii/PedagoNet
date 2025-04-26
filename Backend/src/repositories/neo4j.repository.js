const BaseRepository = require('./base.repository');

class Neo4jRepository extends BaseRepository {
    async createConnection(senderId, receiverId, status = 'pending') {
        const query = `
            MATCH (sender:User {id_user: $senderId}), (receiver:User {id_user: $receiverId})
            CREATE (sender)-[r:CONNECTION {status: $status, createdAt: datetime()}]->(receiver)
            RETURN r`;

        const records = await this.executeQuery(query, { senderId, receiverId, status });
        return records.length > 0;
    }

    async updateConnectionStatus(senderId, receiverId, status) {
        const query = `
            MATCH (sender:User {id_user: $senderId})-[r:CONNECTION]->(receiver:User {id_user: $receiverId})
            SET r.status = $status, r.updatedAt = datetime()
            RETURN r`;

        const records = await this.executeQuery(query, { senderId, receiverId, status });
        return records.length > 0;
    }

    async getConnections(userId, status = null) {
        const query = status ?
            `MATCH (u:User {id_user: $userId})<-[r:CONNECTION {status: $status}]-(other:User)
            RETURN other.id as id, other.email as email, r.status as status` :
            `MATCH (u:User {id_user: $userId})<-[r:CONNECTION]-(other:User)
            RETURN other.id as id, other.email as email, r.status as status`;

        const records = await this.executeQuery(query, { userId, status });
        return records.map(record => ({
            userId: record.get('id'),
            email: record.get('email'),
            status: record.get('status')
        }));
    }
}

module.exports = Neo4jRepository;