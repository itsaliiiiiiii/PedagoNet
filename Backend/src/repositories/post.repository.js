const BaseRepository = require('./base.repository');
const neo4j = require('neo4j-driver');

class PostRepository extends BaseRepository {
    async createPost(authorId, content, visibility, attachments) {
        const query = `
            MATCH (author:User {id_user: $authorId})
            CREATE (p:Post {
                id: randomUUID(),
                content: $content,
                visibility: $visibility,
                attachments: $attachments,
                createdAt: datetime(),
                updatedAt: datetime()
            })
            CREATE (author)-[:AUTHORED]->(p)
            RETURN p, author`;

        const records = await this.executeQuery(query, { 
            authorId, 
            content, 
            visibility, 
            attachments 
        });

        if (records.length === 0) return null;

        const post = records[0].get('p').properties;
        const author = records[0].get('author').properties;

        return { post, author };
    }

    async getPosts(userId, connectedUserIds, limit = 10, skip = 0) {
        const query = `
            MATCH (author:User)-[:AUTHORED]->(p:Post)
            WHERE (p.visibility = 'public' 
                  OR (p.visibility = 'connections' AND author.id_user IN $userIds)
                  OR author.id_user = $userId)
            AND NOT EXISTS {
                MATCH (viewer:User {id_user: $userId})-[:SEEN]->(p)
            }
            RETURN p, author
            ORDER BY p.createdAt DESC
            SKIP $skip
            LIMIT $limit`;

        const records = await this.executeQuery(query, { 
            userId,
            userIds: [userId, ...connectedUserIds],
            skip: neo4j.int(skip),
            limit: neo4j.int(limit)
        });

        return records.map(record => ({
            post: record.get('p').properties,
            author: record.get('author').properties
        }));
    }

    async getPostById(postId) {
        const query = `
            MATCH (author:User)-[:AUTHORED]->(p:Post {id: $postId})
            RETURN p, author`;

        const records = await this.executeQuery(query, { postId });
        if (records.length === 0) return null;

        return {
            post: records[0].get('p').properties,
            author: records[0].get('author').properties
        };
    }

    async updatePost(postId, authorId, updates) {
        let updateStatements = [];
        let params = { postId, authorId };

        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'author') {
                updateStatements.push(`p.${key} = $${key}`);
                params[key] = value;
            }
        });
        updateStatements.push('p.updatedAt = datetime()');

        const query = `
            MATCH (author:User {id_user: $authorId})-[:AUTHORED]->(p:Post {id: $postId})
            SET ${updateStatements.join(', ')}
            RETURN p, author`;

        const records = await this.executeQuery(query, params);
        if (records.length === 0) return null;

        return {
            post: records[0].get('p').properties,
            author: records[0].get('author').properties
        };
    }

    async deletePost(postId, authorId) {
        const query = `
            MATCH (author:User {id_user: $authorId})-[:AUTHORED]->(p:Post {id: $postId})
            DETACH DELETE p
            RETURN count(p) as deleted`;

        const records = await this.executeQuery(query, { postId, authorId });
        return records[0].get('deleted').toNumber() > 0;
    }

    async markPostAsSeen(userId, postId) {
        const query = `
            MATCH (user:User {id_user: $userId}), (post:Post {id: $postId})
            WHERE NOT (user)-[:SEEN]->(post)
            CREATE (user)-[r:SEEN {timestamp: datetime()}]->(post)
            RETURN r`;

        const records = await this.executeQuery(query, { userId, postId });
        return records.length > 0;
    }

    async getSeenPosts(userId) {
        const query = `
            MATCH (user:User {id_user: $userId})-[r:SEEN]->(post:Post)
            RETURN post.id as postId, r.timestamp as seenAt
            ORDER BY r.timestamp DESC`;

        const records = await this.executeQuery(query, { userId });
        return records.map(record => ({
            postId: record.get('postId'),
            seenAt: record.get('seenAt').toString()
        }));
    }
}

module.exports = new PostRepository();