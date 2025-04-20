const neo4j = require('neo4j-driver');
require('dotenv').config();

class BaseRepository {
    constructor() {
        this.driver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
        );
    }

    async getSession() {
        return this.driver.session();
    }

    async closeSession(session) {
        if (session) {
            await session.close();
        }
    }

    async executeQuery(query, params = {}) {
        const session = await this.getSession();
        try {
            const result = await session.run(query, params);
            return result.records;
        } catch (error) {
            console.error('Query execution error:', error);
            throw error;
        } finally {
            await this.closeSession(session);
        }
    }
}

module.exports = BaseRepository;