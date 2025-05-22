require('dotenv').config();
const { neo4jDriver } = require('../config/database')

class BaseRepository {
    constructor() {
        this.driver = neo4jDriver;
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