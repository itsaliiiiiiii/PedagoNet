const Neo4jRepository = require('../repositories/connection.repository');
const neo4jRepository = new Neo4jRepository();

const markPostAsSeen = async (userId, postId) => {
    try {
        const success = await neo4jRepository.markPostAsSeen(userId, postId);
        return success;
    } catch (error) {
        console.error('Error marking post as seen:', error);
        return false;
    }
};

const getSeenPosts = async (userId) => {
    try {
        const seenPosts = await neo4jRepository.getSeenPosts(userId);
        return seenPosts;
    } catch (error) {
        console.error('Error getting seen posts:', error);
        return [];
    }
};

module.exports = {
    markPostAsSeen,
    getSeenPosts
};