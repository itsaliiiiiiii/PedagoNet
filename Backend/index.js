const express = require('express');
const { connectMongoDB, connectNeo4j } = require('./src/config/database');
const authRoutes = require('./src/routes/auth.routes');
const classroomRoutes = require('./src/routes/classroom.routes');
const connectionRoutes = require('./src/routes/connection.routes');
const postRoutes = require('./src/routes/post.routes');
const messageRoutes = require('./src/routes/message.routes');
const taskRoutes = require('./src/routes/task.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to databases
connectMongoDB();
connectNeo4j();

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/classrooms', classroomRoutes);
app.use('/connections', connectionRoutes);
app.use('/posts', postRoutes);
app.use('/messages', messageRoutes);
app.use('/tasks', taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Basic health check route
app.get('/', (req, res) => {
    res.json({ message: 'PedagoNet API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
