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
                createdAt: datetime(),
                updatedAt: datetime()
            })
            CREATE (author)-[:AUTHORED]->(p)
            WITH p
            UNWIND $attachments AS attachment
            CREATE (a:Attachment {
                id: randomUUID(),
                filename: attachment.filename,
                originalName: attachment.originalName,
                mimetype: attachment.mimetype,
                size: attachment.size,
                createdAt: datetime()
            })
            CREATE (p)-[:HAS_ATTACHMENT]->(a)
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

        // Get attachments
        const attachmentsQuery = `
            MATCH (p:Post {id: $postId})-[:HAS_ATTACHMENT]->(a:Attachment)
            RETURN a`;

        const attachmentRecords = await this.executeQuery(attachmentsQuery, { postId: post.id });
        const postAttachments = attachmentRecords.map(record => record.get('a').properties);

        return { 
            post: { ...post, attachments: postAttachments },
            author 
        };
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
            OPTIONAL MATCH (p)<-[like:LIKE]-()
            OPTIONAL MATCH (p)-[:HAS_ATTACHMENT]->(a:Attachment)
            WITH p, author, COUNT(like) as likesCount, COLLECT(a) as attachments
            RETURN p, author, likesCount, attachments
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
            post: {
                ...record.get('p').properties,
                likesCount: record.get('likesCount').toNumber(),
                attachments: record.get('attachments').map(att => att.properties)
            },
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

    async getUserPosts(targetUserId, viewerId, isViewerConnected) {
        const query = `
            MATCH (author:User {id_user: $targetUserId})-[:AUTHORED]->(p:Post)
            WHERE p.visibility = 'public' OR $targetUserId = $viewerId OR $isViewerConnected = true
            RETURN p, author
            ORDER BY p.createdAt DESC`;

        const records = await this.executeQuery(query, { 
            targetUserId, 
            viewerId, 
            isViewerConnected 
        });

        return records.map(record => ({
            post: {
                ...record.get('p').properties,
                likesCount: record.get('likesCount').toNumber()
            },
            author: record.get('author').properties
        }));
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

    async getUserPostsByVisibility(targetUserId, viewerId, isViewerConnected) {
        const query = `
            MATCH (author:User {id_user: $targetUserId})-[:AUTHORED]->(p:Post)
            WHERE (p.visibility = 'public' 
                   OR (p.visibility = 'connections' AND $isConnected)
                   OR $viewerId = $targetUserId)
            RETURN p, author
            ORDER BY p.createdAt DESC`;
    
        const records = await this.executeQuery(query, { 
            targetUserId,
            viewerId,
            isConnected: isViewerConnected
        });
    
        return records.map(record => ({
            post: {
                ...record.get('p').properties,
                likesCount: record.get('likesCount').toNumber()
            },
            author: record.get('author').properties
        }));
    }

    async getPostLikedUsers(postId) {
        const query = `
            MATCH (user:User)-[:LIKE]->(post:Post {id: $postId})
            RETURN user
            ORDER BY user.firstName`;

        const records = await this.executeQuery(query, { postId });
        return records.map(record => record.get('user').properties);
    }

    async addComment(postId, userId, content) {
        const query = `
            MATCH (user:User {id_user: $userId}), (post:Post {id: $postId})
            CREATE (c:Comment {
                id: randomUUID(),
                content: $content,
                createdAt: datetime(),
                updatedAt: datetime()
            })
            CREATE (user)-[:AUTHORED]->(c)
            CREATE (c)-[:ON]->(post)
            RETURN c, user`;

        const records = await this.executeQuery(query, { postId, userId, content });
        if (records.length === 0) return null;

        return {
            comment: records[0].get('c').properties,
            author: records[0].get('user').properties
        };
    }

    async getComments(postId, limit = 10, skip = 0) {
        const query = `
            MATCH (author:User)-[:AUTHORED]->(c:Comment)-[:ON]->(post:Post {id: $postId})
            OPTIONAL MATCH (c)<-[like:LIKE]-()
            WITH c, author, COUNT(like) as likesCount
            RETURN c, author, likesCount
            ORDER BY c.createdAt DESC
            SKIP $skip
            LIMIT $limit`;

        const records = await this.executeQuery(query, {
            postId,
            skip: neo4j.int(skip),
            limit: neo4j.int(limit)
        });

        return records.map(record => ({
            comment: {
                ...record.get('c').properties,
                likesCount: record.get('likesCount').toNumber()
            },
            author: record.get('author').properties
        }));
    }

    async updateComment(commentId, userId, content) {
        const query = `
            MATCH (author:User {id_user: $userId})-[:AUTHORED]->(c:Comment {id: $commentId})
            SET c.content = $content, c.updatedAt = datetime()
            RETURN c, author`;

        const records = await this.executeQuery(query, { commentId, userId, content });
        if (records.length === 0) return null;

        return {
            comment: records[0].get('c').properties,
            author: records[0].get('author').properties
        };
    }

    async deleteComment(commentId, userId) {
        const query = `
            MATCH (author:User {id_user: $userId})-[:AUTHORED]->(c:Comment {id: $commentId})
            DETACH DELETE c
            RETURN count(c) as deleted`;

        const records = await this.executeQuery(query, { commentId, userId });
        return records[0].get('deleted').toNumber() > 0;
    }

    async addReply(commentId, userId, content) {
        const query = `
            MATCH (user:User {id_user: $userId}), (parent:Comment {id: $commentId})
            CREATE (r:Reply {
                id: randomUUID(),
                content: $content,
                createdAt: datetime(),
                updatedAt: datetime()
            })
            CREATE (user)-[:AUTHORED]->(r)
            CREATE (r)-[:REPLY_TO]->(parent)
            RETURN r, user`;

        const records = await this.executeQuery(query, { commentId, userId, content });
        if (records.length === 0) return null;

        return {
            reply: records[0].get('r').properties,
            author: records[0].get('user').properties
        };
    }

    async getReplies(commentId, limit = 10, skip = 0) {
        const query = `
            MATCH (author:User)-[:AUTHORED]->(r:Reply)-[:REPLY_TO]->(parent:Comment {id: $commentId})
            OPTIONAL MATCH (r)<-[like:LIKE]-()
            WITH r, author, COUNT(like) as likesCount
            RETURN r, author, likesCount
            ORDER BY r.createdAt DESC
            SKIP $skip
            LIMIT $limit`;

        const records = await this.executeQuery(query, {
            commentId,
            skip: neo4j.int(skip),
            limit: neo4j.int(limit)
        });

        return records.map(record => ({
            reply: {
                ...record.get('r').properties,
                likesCount: record.get('likesCount').toNumber()
            },
            author: record.get('author').properties
        }));
    }

    async toggleLike(postId, userId) {
        const query = `
            MATCH (user:User {id_user: $userId}), (post:Post {id: $postId})
            OPTIONAL MATCH (user)-[like:LIKE]->(post)
            WITH user, post, like
            CALL apoc.do.when(
                like IS NULL,
                'CREATE (user)-[:LIKE]->(post) RETURN true as liked',
                'DELETE like RETURN false as liked',
                {user: user, post: post, like: like}
            ) YIELD value
            RETURN value.liked as liked`;

        const records = await this.executeQuery(query, { postId, userId });
        return { liked: records[0].get('liked') };
    }

    async getPostLikedUsers(postId, limit = 10, skip = 0) {
        const query = `
            MATCH (user:User)-[:LIKE]->(post:Post {id: $postId})
            RETURN user
            ORDER BY user.firstName
            SKIP $skip
            LIMIT $limit`;

        const records = await this.executeQuery(query, {
            postId,
            skip: neo4j.int(skip),
            limit: neo4j.int(limit)
        });

        return records.map(record => record.get('user').properties);
    }
}

module.exports = new PostRepository();