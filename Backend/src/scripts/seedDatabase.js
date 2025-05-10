const { connectDatabase, neo4jDriver } = require('../config/database');
const { connectMongoDB, mongoose } = require('../config/mongodb');
const crypto = require('crypto'); // Pour générer des UUIDs

// Liste générée pour 20 posts d'Alice
const posts = Array.from({ length: 20 }, (_, index) => ({
    content: `Post numéro ${index + 1}: Contenu générique pour tester la plateforme. #PostTest #Alice`,
    visibility: 'public'
}));

const seedDatabase = async () => {
    try {
        // Connect to Neo4j
        await connectDatabase();
        await connectMongoDB();
        const session = neo4jDriver.session();

        console.log('🗑️ Clearing existing posts for Alice...');
        // Clear posts for Alice (if needed)
        await session.run('MATCH (p:Post)-[:AUTHORED]->(u:User {email: $email}) DETACH DELETE p', {
            email: 'test.student@test.com'
        });

        console.log('📱 Creating 20 posts for Alice...');
        for (const post of posts) {
            const id_post = crypto.randomUUID();
            await session.run(
                'MATCH (u:User {email: $email}) ' +
                'CREATE (p:Post {id_post: $id_post, content: $content, visibility: $visibility, createdAt: datetime()}) ' +
                'CREATE (u)-[:AUTHORED]->(p)',
                {
                    email: 'test.student@test.com',
                    id_post,
                    content: post.content,
                    visibility: post.visibility
                }
            );
        }

        console.log('✅ 20 posts for Alice stored successfully!');

        // Close session and connections
        await session.close();
        await neo4jDriver.close();
        await mongoose.connection.close(); // Close MongoDB connection

        process.exit(0);
    } catch (error) {
        console.error('❌ Error storing posts for Alice:', error);
        process.exit(1);
    }
};

seedDatabase();
