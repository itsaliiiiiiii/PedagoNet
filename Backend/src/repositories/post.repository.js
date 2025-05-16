const BaseRepository = require('./base.repository');
const neo4j = require('neo4j-driver');

class PostRepository extends BaseRepository {
    async createPost(authorId, content, visibility, attachments) {
        // Remove the parsing here as attachments are already objects
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
            WITH p, author
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
            attachments  // Pass attachments directly
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

    // In getPosts method
    async getPosts(userId, connectedUserIds, limit = 100, skip = 0) {
        const query = `
            MATCH (author:User)-[:AUTHORED]->(p:Post)
            WHERE (p.visibility = 'public' 
                OR (p.visibility = 'connections' AND author.id_user IN $userIds)
                OR author.id_user = $userId)
            AND NOT EXISTS {
                MATCH (viewer:User {id_user: $userId})-[:SEEN]->(p)
            }
            OPTIONAL MATCH (p)<-[like:LIKE]-()
            OPTIONAL MATCH (viewer:User {id_user: $userId})-[userLike:LIKE]->(p)
            OPTIONAL MATCH (p)-[:HAS_ATTACHMENT]->(a:Attachment)
            WITH p, author, COUNT(like) as likesCount, COLLECT(a) as attachments, 
                 CASE WHEN userLike IS NOT NULL THEN true ELSE false END as hasLiked
            RETURN p, author, likesCount, attachments, hasLiked
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
                attachments: record.get('attachments').map(att => att.properties),
                hasLiked: record.get('hasLiked')
            },
            author: record.get('author').properties
        }));
    }

    // In getPostById method
    async getPostById(postId, userId) {
        const query = `
            MATCH (author:User)-[:AUTHORED]->(p:Post {id: $postId})
            OPTIONAL MATCH (viewer:User {id_user: $userId})-[userLike:LIKE]->(p)
            OPTIONAL MATCH (p)<-[like:LIKE]-()
            RETURN p, author, 
                   COUNT(like) as likesCount,
                   CASE WHEN userLike IS NOT NULL THEN true ELSE false END as hasLiked`;
    
        const records = await this.executeQuery(query, { postId, userId });
        if (records.length === 0) return null;
    
        return {
            post: {
                ...records[0].get('p').properties,
                likesCount: records[0].get('likesCount').toNumber(),
                hasLiked: records[0].get('hasLiked')
            },
            author: records[0].get('author').properties
        };
    }

    // In getUserPosts method
    async getUserPosts(targetUserId, viewerId, isViewerConnected) {
        const query = `
            MATCH (author:User {id_user: $targetUserId})-[:AUTHORED]->(p:Post)
            WHERE p.visibility = 'public' OR $targetUserId = $viewerId OR $isViewerConnected = true
            OPTIONAL MATCH (p)<-[like:LIKE]-()
            OPTIONAL MATCH (viewer:User {id_user: $viewerId})-[userLike:LIKE]->(p)
            RETURN p, author, COUNT(like) as likesCount,
                   CASE WHEN userLike IS NOT NULL THEN true ELSE false END as hasLiked
            ORDER BY p.createdAt DESC`;
    
        const records = await this.executeQuery(query, { 
            targetUserId, 
            viewerId, 
            isViewerConnected 
        });
    
        return records.map(record => ({
            post: {
                ...record.get('p').properties,
                likesCount: record.get('likesCount').toNumber(),
                hasLiked: record.get('hasLiked')
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
            FOREACH (x IN CASE 
                WHEN like IS NULL THEN [1] 
                ELSE [] 
                END | 
                CREATE (user)-[:LIKE {createdAt: datetime()}]->(post)
            )
            FOREACH (x IN CASE 
                WHEN like IS NOT NULL THEN [1] 
                ELSE [] 
                END | 
                DELETE like
            )
            RETURN CASE 
                WHEN like IS NULL THEN true 
                ELSE false 
                END as liked`;
    
        const records = await this.executeQuery(query, { postId, userId });
        
        if (!records || records.length === 0) {
            return { liked: false };
        }
    
        return {
            liked: records[0].get('liked')
        };
    }

    async getPostLikedUsers(postId, limit = 10, skip = 0) {
        const query = `
            MATCH (user:User)-[:LIKE]->(post:Post {id: $postId})
            WITH user
            ORDER BY user.firstName
            SKIP $skip
            LIMIT $limit
            RETURN COLLECT({
                id_user: user.id_user,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePhoto: user.profilePhoto
            }) as users`;
    
        const records = await this.executeQuery(query, {
            postId,
            skip: neo4j.int(skip),
            limit: neo4j.int(limit)
        });
    
        return records[0].get('users');
    }
}

module.exports = new PostRepository();