const neo4j = require('neo4j-driver');
const bcrypt = require('bcrypt');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const createUser = async (userData) => {
    const session = driver.session();
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const id_user = require('crypto').randomUUID();
        
        const result = await session.run(
            `CREATE (u:User {
                id_user: $id_user,
                email: $email,
                password: $password,
                firstName: $firstName,
                lastName: $lastName,
                dateOfBirth: datetime($dateOfBirth),
                role: $role,
                isVerified: $isVerified,
                createdAt: datetime(),
                updatedAt: datetime()
            }) RETURN u`,
            {
                id_user,
                email: userData.email.toLowerCase(),
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                dateOfBirth: userData.dateOfBirth,
                role: userData.role,
                isVerified: false
            }
        );
        
        const user = result.records[0].get('u').properties;
        return { success: true, user };
    } catch (error) {
        console.error('User creation error:', error);
        return { success: false, error: error.message };
    } finally {
        await session.close();
    }
};

const findUserByEmail = async (email) => {
    const session = driver.session();
    try {
        const result = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email: email.toLowerCase() }
        );
        
        if (result.records.length === 0) return null;
        return result.records[0].get('u').properties;
    } catch (error) {
        console.error('Find user error:', error);
        return null;
    } finally {
        await session.close();
    }
};

const findUserById = async (userId) => {
    const session = driver.session();
    try {
        const result = await session.run(
            'MATCH (u:User {id_user: $userId}) RETURN u',
            { userId }
        );
        
        if (result.records.length === 0) return null;
        return result.records[0].get('u').properties;
    } catch (error) {
        console.error('Find user error:', error);
        return null;
    } finally {
        await session.close();
    }
};

const updateUser = async (userId, updateData) => {
    const session = driver.session();
    try {
        let updates = [];
        let params = { userId };
        
        Object.entries(updateData).forEach(([key, value]) => {
            if (key !== 'id_user') {
                updates.push(`u.${key} = $${key}`);
                params[key] = value;
            }
        });
        
        updates.push('u.updatedAt = datetime()');
        
        const result = await session.run(
            `MATCH (u:User {id_user: $userId})
             SET ${updates.join(', ')}
             RETURN u`,
            params
        );
        
        return result.records[0].get('u').properties;
    } catch (error) {
        console.error('Update user error:', error);
        return null;
    } finally {
        await session.close();
    }
};

const comparePassword = async (user, candidatePassword) => {
    return bcrypt.compare(candidatePassword, user.password);
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    comparePassword
};