const BaseRepository = require('./base.repository');

class AuthRepository extends BaseRepository {
    async findUserByEmail(email) {
        const query = 'MATCH (u:User {email: $email}) RETURN u';
        const records = await this.executeQuery(query, { email: email.toLowerCase() });
        return records.length > 0 ? records[0].get('u').properties : null;
    }

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

    async createUser(userData, hashedPassword, id_user) {
        const query = `
            CREATE (u:User {
                id_user: $id_user,
                email: $email,
                password: $password,
                firstName: $firstName,
                lastName: $lastName,
                dateOfBirth: datetime($dateOfBirth),
                role: $role,
                isVerified: true,
                createdAt: datetime(),
                updatedAt: datetime()
            }) RETURN u`;

        const params = {
            id_user,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth,
            role: userData.role
        };

        const records = await this.executeQuery(query, params);
        return records[0].get('u').properties;
    }
}

module.exports = new AuthRepository();