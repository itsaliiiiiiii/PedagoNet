const userRepository = require('../repositories/user.repository');
const fs = require('fs').promises;
const path = require('path');

const getUserProfile = async (userId) => {
    try {
        const user = await userRepository.findById(userId);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Remove sensitive information
        const { password, ...userProfile } = user;
        
        return {
            success: true,
            profile: userProfile
        };
    } catch (error) {
        console.error('Get profile error:', error);
        return { success: false, message: 'Failed to get user profile' };
    }
};

const updateUserProfile = async (userId, updateData) => {
    try {
        // Prevent updating sensitive fields
        const { password, email, role, id_user, ...allowedUpdates } = updateData;
        
        const updatedUser = await userRepository.update(userId, allowedUpdates);
        
        if (!updatedUser) {
            return { success: false, message: 'Failed to update profile' };
        }

        // Remove sensitive information from response
        const { password: _, ...userProfile } = updatedUser;
        
        return {
            success: true,
            message: 'Profile updated successfully',
            profile: userProfile
        };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, message: 'Failed to update profile' };
    }
};

const updateProfilePhoto = async (userId, filename) => {
    try {
        // Get old profile photo if exists
        const user = await userRepository.findById(userId);
        const oldPhoto = user.profilePhoto;

        // Update profile photo in database
        const updatedUser = await userRepository.update(userId, {
            profilePhoto: filename
        });

        if (!updatedUser) {
            return { success: false, message: 'Failed to update profile photo' };
        }

        // Delete old photo if exists
        if (oldPhoto) {
            const oldPhotoPath = path.join(__dirname, '../../uploads', oldPhoto);
            try {
                await fs.unlink(oldPhotoPath);
            } catch (error) {
                console.error('Error deleting old profile photo:', error);
            }
        }

        return {
            success: true,
            message: 'Profile photo updated successfully',
            profilePhoto: filename
        };
    } catch (error) {
        console.error('Update profile photo error:', error);
        return { success: false, message: 'Failed to update profile photo' };
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateProfilePhoto
};