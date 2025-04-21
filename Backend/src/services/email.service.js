const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, code) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification Code - PedagoNet',
            html: `
                <h1>Welcome to PedagoNet!</h1>
                <p>Your verification code is: <strong>${code}</strong></p>
                <p>This code will expire in ${process.env.VERIFICATION_CODE_EXPIRY / 60} minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

module.exports = {
    sendVerificationEmail
};