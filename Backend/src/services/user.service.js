const userRepository = require('../repositories/user.repository');

const createUser = async (userData) => {
    try {
        const user = await userRepository.create(userData);
        return { success: true, user };
    } catch (error) {
        console.error('User creation error:', error);
        return { success: false, error: error.message };
    }
};

const findUserByEmail = async (email) => {
    try {
        return await userRepository.findByEmail(email);
    } catch (error) {
        console.error('Find user error:', error);
        return null;
    }
};

const findUserById = async (userId) => {
    try {
        return await userRepository.findById(userId);
    } catch (error) {
        console.error('Find user error:', error);
        return null;
    }
};

const updateUser = async (userId, updateData) => {
    try {
        return await userRepository.update(userId, updateData);
    } catch (error) {
        console.error('Update user error:', error);
        return null;
    }
};

const comparePassword = async (user, candidatePassword) => {
    return userRepository.comparePassword(user, candidatePassword);
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    comparePassword
};