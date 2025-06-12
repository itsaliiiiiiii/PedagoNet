// const mongoose = require('mongoose');
// const Comment = require('../models/comment.model'); // Vérifie le chemin de ton modèle

// const targetPostId = 'e53bf74d-cf54-497b-9578-79ab0eb7b05f';
// const mongoUri = 'mongodb://127.0.0.1:27017/test';

// async function deleteCommentsByPost() {
//   try {
//     await mongoose.connect(mongoUri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log(`🗑️ Suppression des commentaires du post ${targetPostId}...`);

//     const result = await Comment.deleteMany({ postId: targetPostId });

//     console.log(`✅ ${result.deletedCount} commentaire(s) supprimé(s).`);

//     await mongoose.disconnect();
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Erreur lors de la suppression :", error);
//     process.exit(1);
//   }
// }

// deleteCommentsByPost();

// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const documentSchema = new Schema({
//   _id: String,
//   postId: String,
//   comments: [
//     {
//       content: String,
//       user: {
//         id: String,
//         name: String,
//         email: String,
//       },
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],
// });

// const PostWithComments = mongoose.model('PostWithComments', documentSchema);

// const mongoUri = 'mongodb://127.0.0.1:27017/test';

// const postId = 'e53bf74d-cf54-497b-9578-79ab0eb7b05f';

// const randomComments = [
//   "Très bon article !",
//   "Merci pour le partage.",
//   "C’est vraiment utile.",
//   "Bonne idée !",
//   "Super intéressant.",
//   "Merci pour l'explication !",
//   "Je vais essayer ça bientôt.",
// ];

// const users = [
//   {
//     id: '59b8f4f7-acc2-422a-a8c1-98c96e9a4563',
//     name: 'Alice Dupont',
//     email: 'user1@example.com',
//   },
//   {
//     id: 'd6ac2a29-a88d-460e-b92a-9a7b909d4c1b',
//     name: 'Jean Martin',
//     email: 'user2@example.com',
//   },
// ];

// async function insertSinglePostWithComments() {
//   try {
//     await mongoose.connect(mongoUri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     const comments = [];

//     for (let i = 0; i < 10; i++) {
//       const user = users[Math.floor(Math.random() * users.length)];
//       const content = randomComments[Math.floor(Math.random() * randomComments.length)];

//       comments.push({
//         content,
//         user,
//         createdAt: new Date(),
//       });
//     }

//     const doc = new PostWithComments({
//       _id: postId,
//       postId: 'mon-post-ref-123', // à adapter selon ton usage
//       comments,
//     });

//     await doc.save();
//     console.log('✅ Document inséré avec succès');

//     await mongoose.disconnect();
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Erreur lors de l’insertion du document :', error);
//     process.exit(1);
//   }
// }

// insertSinglePostWithComments();


const axios = require('axios');

const API_URL = 'http://localhost:8081/comments'; // Adapt to your base URL
const postId = 'e53bf74d-cf54-497b-9578-79ab0eb7b05f';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiZDZhYzJhMjktYTg4ZC00NjBlLWI5MmEtOWE3YjkwOWQ0YzFiIiwiZW1haWwiOiJ0ZXN0LnN0dWRlbnQyQHRlc3QuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NDc0Mjk1MzQsImV4cCI6MTc0NzUxNTkzNH0.N9kacdtjbeDVxVIP_M_-eyk0if8FC_h1oP6ukRx2njA';

const comments = [
  "Très bon article !",
  "Merci pour le partage.",
  "C’est vraiment utile.",
  "Bonne idée !",
  "Super intéressant.",
  "Merci pour l'explication !",
  "Je vais essayer ça bientôt.",
];

async function insertComments() {
  for (const content of comments) {
    try {
      const res = await axios.post(`${API_URL}/${postId}`, {
        content,
        parentCommentId: null, // ou un ID si c'est une réponse à un commentaire
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log(`✅ Commentaire ajouté : "${content}"`);
    } catch (err) {
      console.error(`❌ Échec pour "${content}"`, err.response?.data || err.message);
    }
  }
}

insertComments();
