const Neo4jRepository = require('../repositories/neo4j.repository');
const neo4jRepository = new Neo4jRepository();

const createConnection = async (senderId, receiverId, status = 'pending') => {
    try {
        const success = await neo4jRepository.createConnection(senderId, receiverId, status);
        return success;
    } catch (error) {
        console.error('Neo4j connection creation error:', error);
        return false;
    }
};

const updateConnectionStatus = async (senderId, receiverId, status) => {
    try {
        const success = await neo4jRepository.updateConnectionStatus(senderId, receiverId, status);
        return success;
    } catch (error) {
        console.error('Neo4j connection update error:', error);
        return false;
    }
};

const getConnections = async (userId, status = null) => {
    try {
        const connections = await neo4jRepository.getConnections(userId, status);
        return connections;
    } catch (error) {
        console.error('Neo4j get connections error:', error);
        return [];
    }
};

module.exports = {
    createConnection,
    updateConnectionStatus,
    getConnections
};