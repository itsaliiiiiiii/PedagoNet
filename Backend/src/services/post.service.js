const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

// Create a new post
const createPost = async (authorId, content, visibility = 'public', attachments = []) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (author:User {id: $authorId})
             CREATE (p:Post {
                id: randomUUID(),
                content: $content,
                visibility: $visibility,
                attachments: $attachments,
                createdAt: datetime(),
                updatedAt: datetime()
             })
             CREATE (author)-[:AUTHORED]->(p)
             RETURN p, author`,
            { authorId, content, visibility, attachments }
        );

        const post = result.records[0].get('p').properties;
        const author = result.records[0].get('author').properties;

        return {
            success: true,
            post: {
                ...post,
                author: {
                    id: author.id,
                    firstName: author.firstName,
                    lastName: author.lastName
                }
            }
        };
    } catch (error) {
        console.error('Post creation error:', error);
        return { success: false, message: 'Failed to create post' };
    } finally {
        await session.close();
    }
};

// Get posts with visibility filtering
const getPosts = async (userId, connectedUserIds, limit = 10, skip = 0) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (author:User)-[:AUTHORED]->(p:Post)
             WHERE author.id IN $userIds
             AND (p.visibility = 'public' OR p.visibility = 'connections')
             RETURN p, author
             ORDER BY p.createdAt DESC
             SKIP $skip
             LIMIT $limit`,
            { 
                userIds: [userId, ...connectedUserIds],
                skip: neo4j.int(skip),
                limit: neo4j.int(limit)
            }
        );

        const posts = result.records.map(record => {
            const post = record.get('p').properties;
            const author = record.get('author').properties;
            return {
                ...post,
                author: {
                    id: author.id,
                    firstName: author.firstName,
                    lastName: author.lastName
                }
            };
        });

        return { success: true, posts };
    } catch (error) {
        console.error('Posts retrieval error:', error);
        return { success: false, message: 'Failed to retrieve posts' };
    } finally {
        await session.close();
    }
};

// Get a specific post
const getPostById = async (postId) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (author:User)-[:AUTHORED]->(p:Post {id: $postId})
             RETURN p, author`,
            { postId }
        );

        if (result.records.length === 0) {
            return { success: false, message: 'Post not found' };
        }

        const post = result.records[0].get('p').properties;
        const author = result.records[0].get('author').properties;

        return {
            success: true,
            post: {
                ...post,
                author: {
                    id: author.id,
                    firstName: author.firstName,
                    lastName: author.lastName
                }
            }
        };
    } catch (error) {
        console.error('Post retrieval error:', error);
        return { success: false, message: 'Failed to retrieve post' };
    } finally {
        await session.close();
    }
};

// Update a post
const updatePost = async (postId, authorId, updates) => {
    const session = driver.session();
    try {
        let updateStatements = [];
        let params = { postId, authorId };

        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'author') {
                updateStatements.push(`p.${key} = $${key}`);
                params[key] = value;
            }
        });
        updateStatements.push('p.updatedAt = datetime()');

        const result = await session.run(
            `MATCH (author:User {id: $authorId})-[:AUTHORED]->(p:Post {id: $postId})
             SET ${updateStatements.join(', ')}
             RETURN p, author`,
            params
        );

        if (result.records.length === 0) {
            return { success: false, message: 'Post not found or not authorized' };
        }

        const post = result.records[0].get('p').properties;
        const author = result.records[0].get('author').properties;

        return {
            success: true,
            post: {
                ...post,
                author: {
                    id: author.id,
                    firstName: author.firstName,
                    lastName: author.lastName
                }
            }
        };
    } catch (error) {
        console.error('Post update error:', error);
        return { success: false, message: 'Failed to update post' };
    } finally {
        await session.close();
    }
};

// Delete a post
const deletePost = async (postId, authorId) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (author:User {id: $authorId})-[:AUTHORED]->(p:Post {id: $postId})
             DETACH DELETE p
             RETURN count(p) as deleted`,
            { postId, authorId }
        );

        const deleted = result.records[0].get('deleted').toNumber();
        return {
            success: deleted > 0,
            message: deleted > 0 ? 'Post deleted successfully' : 'Post not found or not authorized'
        };
    } catch (error) {
        console.error('Post deletion error:', error);
        return { success: false, message: 'Failed to delete post' };
    } finally {
        await session.close();
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
};