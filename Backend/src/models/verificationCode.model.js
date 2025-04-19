const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: process.env.VERIFICATION_CODE_EXPIRY
    }
});

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

module.exports = VerificationCode;