const { connectDatabase, neo4jDriver } = require('../config/database');
const { connectMongoDB, mongoose } = require('../config/mongodb');
const crypto = require('crypto');

// Générateur de contenu aléatoire
const randomSentences = [
    "Aujourd'hui, j'ai appris quelque chose de nouveau.",
    "Un jour parfait commence par une bonne tasse de café.",
    "Ce post est généré aléatoirement pour tester la plateforme.",
    "La programmation, c'est comme la magie mais réelle.",
    "Le soleil brille même après les jours nuageux.",
    "Connaissance partagée est connaissance doublée.",
    "Est-ce que quelqu’un d’autre aime le JavaScript ici ?",
    "L’éducation change le monde, un élève à la fois.",
    "Chaque jour est une nouvelle opportunité.",
    "Post généré pour des tests internes. Merci de l’ignorer.",
    "Test #1 : L’API fonctionne bien.",
    "Test #2 : Ce contenu est visible publiquement.",
    "Inspiré par les étoiles, motivé par la connaissance.",
    "J’apprécie vraiment la plateforme aujourd’hui.",
    "Un bug corrigé est une victoire célébrée.",
    "Le savoir est un super-pouvoir.",
    "Apprendre n’est jamais une perte de temps.",
    "L’enseignement est un art autant qu’une science.",
    "Toujours curieux, toujours en train d’explorer.",
    "Les tests passent, la paix règne."
];

// Génération de 20 posts aléatoires
const posts = Array.from({ length: 20 }, () => ({
    content: randomSentences[Math.floor(Math.random() * randomSentences.length)],
    visibility: 'public',
    likesCount: Math.floor(Math.random() * 101) // 0 à 100
}));

const seedDatabase = async () => {
    try {
        // Connexions aux bases
        await connectDatabase();
        await connectMongoDB();
        const session = neo4jDriver.session();

        console.log('🗑️ Suppression des anciens posts de Alice...');
        await session.run(
            'MATCH (p:Post)-[:AUTHORED]->(u:User {email: $email}) DETACH DELETE p',
            { email: 'test.student@test.com' }
        );

        console.log('📝 Création de 20 nouveaux posts aléatoires pour Alice...');
        for (const post of posts) {
            const id_post = crypto.randomUUID();
            await session.run(
                `
                MATCH (u:User {email: $email})
                CREATE (p:Post {
                    id_post: $id_post,
                    content: $content,
                    visibility: $visibility,
                    likesCount: $likesCount,
                    createdAt: datetime()
                })
                CREATE (u)-[:AUTHORED]->(p)
                `,
                {
                    email: 'test.student@test.com',
                    id_post,
                    content: post.content,
                    visibility: post.visibility,
                    likesCount: post.likesCount
                }
            );
        }

        console.log('✅ 20 posts générés avec succès pour Alice !');

        // Fermeture des connexions
        await session.close();
        await neo4jDriver.close();
        await mongoose.connection.close();

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur pendant le seed :', error);
        process.exit(1);
    }
};

seedDatabase();
