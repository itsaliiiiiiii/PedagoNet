const neo4j = require('neo4j-driver');
require('dotenv').config();

// Debug environment variables
console.log('NEO4J_URI:', process.env.NEO4J_URI);
console.log('NEO4J_USERNAME:', process.env.NEO4J_USERNAME);
console.log('NEO4J_PASSWORD:', process.env.NEO4J_PASSWORD ? '***' : 'undefined');

const neo4jDriver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
    { encrypted: false }
);

const connectDatabase = async () => {
    try {
        await neo4jDriver.verifyConnectivity();
        console.log('Neo4j connected successfully');
    } catch (error) {
        console.error('Neo4j connection error:', error);
        process.exit(1);
    }
};

module.exports = {
    connectDatabase,
    neo4jDriver
};