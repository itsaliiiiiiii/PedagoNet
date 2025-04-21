const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const createConnection = async (senderId, receiverId, status = 'pending') => {
    const session = driver.session();
    try {
        await session.run(
            `MATCH (sender:User {id_user: $senderId}), (receiver:User {id_user: $receiverId})
             CREATE (sender)-[r:CONNECTION {status: $status, createdAt: datetime()}]->(receiver)
             RETURN r`,
            { senderId, receiverId, status }
        );
        return true;
    } catch (error) {
        console.error('Neo4j connection creation error:', error);
        return false;
    } finally {
        await session.close();
    }
};

const updateConnectionStatus = async (senderId, receiverId, status) => {
    const session = driver.session();
    try {
        await session.run(
            `MATCH (sender:User {id_user: $senderId})-[r:CONNECTION]->(receiver:User {id_user: $receiverId})
             SET r.status = $status, r.updatedAt = datetime()
             RETURN r`,
            { senderId, receiverId, status }
        );
        return true;
    } catch (error) {
        console.error('Neo4j connection update error:', error);
        return false;
    } finally {
        await session.close();
    }
};

const getConnections = async (userId, status = null) => {
    const session = driver.session();
    try {
        const query = status ?
            `MATCH (u:User {id_user: $userId})<-[r:CONNECTION {status: $status}]-(other:User)
            RETURN other.id as id, other.email as email, r.status as status` :
            `MATCH (u:User {id_user: $userId})<-[r:CONNECTION]-(other:User)
            RETURN other.id as id, other.email as email, r.status as status`;

        const result = await session.run(query, { userId, status });
        return result.records.map(record => ({
            userId: record.get('id'),
            email: record.get('email'),
            status: record.get('status')
        }));
    } catch (error) {
        console.error('Neo4j get connections error:', error);
        return [];
    } finally {
        await session.close();
    }
};

module.exports = {
    createConnection,
    updateConnectionStatus,
    getConnections
};