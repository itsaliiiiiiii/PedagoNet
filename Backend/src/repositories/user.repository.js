const BaseRepository = require('./base.repository');
const bcrypt = require('bcrypt');

class UserRepository extends BaseRepository {
    async findByEmail(email) {
        const query = 'MATCH (u:User {email: $email}) RETURN u';
        const records = await this.executeQuery(query, { email: email.toLowerCase() });
        return records.length > 0 ? records[0].get('u').properties : null;
    }

    async findById(userId) {
        const query = 'MATCH (u:User {id_user: $userId}) RETURN u';
        const records = await this.executeQuery(query, { userId });
        return records.length > 0 ? records[0].get('u').properties : null;
    }

    async create(userData) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const query = `
            CREATE (u:User {
                id_user: randomUUID(),
                email: $email,
                password: $password,
                firstName: $firstName,
                lastName: $lastName,
                dateOfBirth: datetime($dateOfBirth),
                role: $role,
                isVerified: $isVerified,
                createdAt: datetime(),
                updatedAt: datetime()
            }) RETURN u
        `;

        const params = {
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth,
            role: userData.role,
            isVerified: false
        };

        const records = await this.executeQuery(query, params);
        return records[0].get('u').properties;
    }

    async update(userId, updateData) {
        let updates = [];
        let params = { userId };
        
        Object.entries(updateData).forEach(([key, value]) => {
            if (key !== 'id') {
                updates.push(`u.${key} = $${key}`);
                params[key] = value;
            }
        });
        
        updates.push('u.updatedAt = datetime()');
        
        const query = `
            MATCH (u:User {id_user: $userId})
            SET ${updates.join(', ')}
            RETURN u
        `;
        
        const records = await this.executeQuery(query, params);
        return records[0].get('u').properties;
    }

    async comparePassword(user, candidatePassword) {
        return bcrypt.compare(candidatePassword, user.password);
    }
}

module.exports = new UserRepository();