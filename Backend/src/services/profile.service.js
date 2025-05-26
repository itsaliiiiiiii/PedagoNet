const userRepository = require('../repositories/user.repository');
const fs = require('fs').promises;
const path = require('path');
const { getConnections } = require('./connection.service');
const { getUserPosts } = require('./post.service');

const getUserProfile = async (userId) => {
    try {
        const user = await userRepository.findById(userId);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Remove sensitive information
        const { password, ...userProfile } = user;
        
        // Add photo URL if exists
        if (userProfile.profilePhoto) {
            userProfile.profilePhotoUrl = `/upload/${userProfile.profilePhoto.filename}`;
        }

        // Get connection count
        const connections = await getConnections(userId, 'accepted');
        userProfile.connectionCount = connections ? connections.length : 0;

        // Get post count
        const postsResult = await getUserPosts(userId, userId, true);
        userProfile.postCount = postsResult.success ? postsResult.posts.length : 0;
        
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

const updateProfilePhoto = async (userId, file) => {
    try {
        // Get old profile photo if exists
        const user = await userRepository.findById(userId);
        const oldPhoto = user.profilePhoto;

        const updatedUser = await userRepository.update(userId, {
            profilePhotoFilename: file.filename,
            profilePhotoOriginalName: file.originalname,
            profilePhotoMimeType: file.mimetype,
            profilePhotoSize: file.size,
        });

        if (!updatedUser) {
            return { success: false, message: "Failed to update profile photo" };
        }

        // Delete old photo if exists
        if (oldPhoto && oldPhoto.filename) {
            const oldPhotoPath = path.join(
                __dirname,
                "../../upload",
                oldPhoto.filename
            );
            try {
                await fs.unlink(oldPhotoPath);
            } catch (error) {
                console.error("Error deleting old profile photo:", error);
            }
        }

        const photoData = {
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        };

        return {
            success: true,
            message: "Profile photo updated successfully",
            profilePhoto: photoData,
            profilePhotoUrl: `/upload/${file.filename}`,
        };

    } catch (error) {
        console.error("Update profile photo error:", error);
        return { success: false, message: "Failed to update profile photo" };
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateProfilePhoto
};