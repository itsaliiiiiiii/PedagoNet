const BaseRepository = require('./base.repository');

class AuthRepository extends BaseRepository {
    async findVerificationCode(email, code) {
        const query = `
            MATCH (v:VerificationCode {email: $email, code: $code})
            WHERE datetime() < v.createdAt + duration('PT1H')
            RETURN v
        `;
        const records = await this.executeQuery(query, { email: email.toLowerCase(), code });
        return records.length > 0 ? records[0].get('v').properties : null;
    }

    async createVerificationCode(email, code) {
        const query = `
            CREATE (v:VerificationCode {
                email: $email,
                code: $code,
                createdAt: datetime()
            })
            RETURN v
        `;
        const records = await this.executeQuery(query, { email: email.toLowerCase(), code });
        return records[0].get('v').properties;
    }

    async deleteVerificationCode(email) {
        const query = 'MATCH (v:VerificationCode {email: $email}) DELETE v';
        await this.executeQuery(query, { email: email.toLowerCase() });
    }

    async checkExistingUser(email) {
        const query = 'MATCH (u:User {email: $email}) RETURN u';
        const records = await this.executeQuery(query, { email: email.toLowerCase() });
        return records.length > 0;
    }
}

module.exports = new AuthRepository();