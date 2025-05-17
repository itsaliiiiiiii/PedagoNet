const BaseRepository = require('./base.repository');

class Neo4jRepository extends BaseRepository {
    async createConnection(senderId, receiverId, status = 'pending') {
        const query = `
            MATCH (sender:User {id_user: $senderId}), (receiver:User {id_user: $receiverId})
            CREATE (sender)-[r:REQUESTED {status: $status, createdAt: datetime()}]->(receiver)
            RETURN r`;
    
        const records = await this.executeQuery(query, { senderId, receiverId, status });
        return records.length > 0;
    }
    
    async updateConnectionStatus(senderId, receiverId, status) {
        const query = status === 'accepted' ? `
            MATCH (sender:User {id_user: $senderId})-[r:REQUESTED]->(receiver:User {id_user: $receiverId})
            DELETE r
            CREATE (sender)-[c:CONNECTION {status: $status, createdAt: datetime()}]->(receiver)
            RETURN c as r` : `
            MATCH (sender:User {id_user: $senderId})-[r:REQUESTED]->(receiver:User {id_user: $receiverId})
            SET r.status = $status, r.updatedAt = datetime()
            RETURN r`;
    
        const records = await this.executeQuery(query, { senderId, receiverId, status });
        return records.length > 0;
    }
    
    async getConnections(userId, status = null) {
        const relationshipType = status === 'accepted' ? 'CONNECTION' : 'REQUESTED';
        const query = status ?
            `MATCH (u:User {id_user: $userId})-[r:${relationshipType} {status: $status}]-(other:User)
            RETURN other.id_user as id,
                   other.email as email,
                   other.firstName as firstName,
                   other.lastName as lastName,
                   other.profilePhoto as profilePhoto,
                   other.role as role,
                   other.department as department,
                   other.class as class,
                   r.status as status,
                   r.createdAt as sentAt
            ORDER BY r.createdAt DESC` :
            `MATCH (u:User {id_user: $userId})<-[r:REQUESTED|CONNECTION]-(other:User)
            RETURN other.id_user as id,
                   other.email as email,
                   other.firstName as firstName,
                   other.lastName as lastName,
                   other.profilePhoto as profilePhoto,
                   other.role as role,
                   other.department as department,
                   other.class as class,
                   r.status as status,
                   r.createdAt as sentAt
            ORDER BY r.createdAt DESC`;
    
        const records = await this.executeQuery(query, { userId, status });
        return records.map(record => ({
            userId: record.get('id'),
            email: record.get('email'),
            firstName: record.get('firstName'),
            lastName: record.get('lastName'),
            profilePhoto: record.get('profilePhoto'),
            role: record.get('role'),
            department: record.get('department'),
            class: record.get('class'),
            status: record.get('status'),
            sentAt: record.get('sentAt').toString()
        }));
    }

    async refuseConnection(senderId, receiverId) {
        const query = `
            MATCH (sender:User {id_user: $senderId})-[r:REQUESTED]->(receiver:User {id_user: $receiverId})
            DELETE r
            RETURN COUNT(r) > 0 as wasDeleted`;
    
        const records = await this.executeQuery(query, { senderId, receiverId });
        return records[0]?.get('wasDeleted') || false;
    }

    async deleteConnection(userId1, userId2) {
        const query = `
            MATCH (u1:User {id_user: $userId1})-[r:CONNECTION]-(u2:User {id_user: $userId2})
            DELETE r
            RETURN COUNT(r) > 0 as wasDeleted`;
    
        const records = await this.executeQuery(query, { userId1, userId2 });
        return records[0]?.get('wasDeleted') || false;
    }
}

module.exports = Neo4jRepository;