const mongoose = require('mongoose');
const crypto = require('crypto');
const Comment = require('../models/comment.model'); 

// Exemple de phrases aléatoires pour les commentaires
const randomComments = [
  "Super post, merci pour le partage !",
  "Je suis tout à fait d'accord avec toi.",
  "Peux-tu développer davantage ce point ?",
  "Excellent contenu, continue comme ça.",
  "J'ai une question par rapport à ce que tu as dit.",
  "Merci pour cette information précieuse.",
  "Cela m'a beaucoup aidé, merci !",
  "Intéressant, je vais creuser le sujet.",
  "J'aime bien ton point de vue.",
  "C'est une très bonne idée !",
];

// Exemple simple d'utilisateurs (doit correspondre à ceux en base)
const users = [
  { id_user: '59b8f4f7-acc2-422a-a8c1-98c96e9a4563' },
  { id_user: 'd6ac2a29-a88d-460e-b92a-9a7b909d4c1b' },
  { id_user: '0671c71b-a14c-4d2f-8514-e459fcd2ad0e' },
];

// ID du post auquel on ajoute les commentaires (à adapter)
const targetPostId = 'e53bf74d-cf54-497b-9578-79ab0eb7b05f';

// Connexion MongoDB - adapte l'URL
const mongoUri = 'mongodb://127.0.0.1:27017/test';

async function seedComments() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🗑️ Suppression des anciens commentaires du post ${targetPostId}...`);
    await Comment.deleteMany({ postId: targetPostId });

    console.log(`📝 Création de commentaires aléatoires pour le post ${targetPostId}...`);

    const commentsToInsert = [];

    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const content = randomComments[Math.floor(Math.random() * randomComments.length)];

      commentsToInsert.push({
        userId: user.id_user,
        postId: targetPostId,
        content,
        createdAt: new Date(),
      });
    }

    await Comment.insertMany(commentsToInsert);

    console.log("✅ Commentaires créés avec succès !");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed des commentaires :', error);
    process.exit(1);
  }
}

seedComments();
