const mongoose = require('mongoose');
require('dotenv').config();

// School database connection configuration
const schoolDatabaseConnection = mongoose.createConnection(process.env.SCHOOL_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define the schema for the school's user collection
const SchoolUserSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    role: String
}, { collection: 'users' }); // Specify the actual collection name in school's database

// Create the model using the school database connection
const SchoolUser = schoolDatabaseConnection.model('SchoolUser', SchoolUserSchema);

module.exports = {
    schoolDatabaseConnection,
    SchoolUser
};