const Neo4jRepository = require('../repositories/neo4j.repository');
const neo4jRepository = new Neo4jRepository();

const ConnectionRepository = require('../repositories/connection.repository');
const connectionRepository = new ConnectionRepository();

const createConnection = async (senderId, receiverId, status = 'pending') => {
    try {
        const success = await connectionRepository.createConnection(senderId, receiverId, status);
        return success;
    } catch (error) {
        console.error('Connection creation error:', error);
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

const refuseConnection = async (senderId, receiverId) => {
    try {
        return await neo4jRepository.refuseConnection(senderId, receiverId);
    } catch (error) {
        console.error('Error refusing connection:', error);
        return false;
    }
};

const deleteConnection = async (userId1, userId2) => {
    try {
        return await connectionRepository.deleteConnection(userId1, userId2);
    } catch (error) {
        console.error('Error deleting connection:', error);
        return false;
    }
};

module.exports = {
    createConnection,
    updateConnectionStatus,
    getConnections,
    refuseConnection,
    deleteConnection
};