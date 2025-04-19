const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
require('dotenv').config();

// MongoDB Connection
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Neo4j Connection
const neo4jDriver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const connectNeo4j = async () => {
    try {
        await neo4jDriver.verifyConnectivity();
        console.log('Neo4j connected successfully');
    } catch (error) {
        console.error('Neo4j connection error:', error);
        process.exit(1);
    }
};

module.exports = {
    connectMongoDB,
    connectNeo4j,
    neo4jDriver
};