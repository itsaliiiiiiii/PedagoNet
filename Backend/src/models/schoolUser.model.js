const mongoose = require('mongoose');

const schoolUserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['student', 'professor'], required: true },
    department: { type: String }, // For professors
    major: { type: String },      // For students
    dateOfBirth: { type: Date, required: true }
});

module.exports = mongoose.model('SchoolUser', schoolUserSchema);