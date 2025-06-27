const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter using Resend's SMTP details
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.FROM_EMAIL, // Use the email from environment variables
            pass: process.env.FROM_PASSWORD // Use the password from environment variables
        }
    });

    // Define the email options
    const mailOptions = {
        from: 'TripNest <no-reply@gmail.com>',
        to: options.email,
        subject: options.subject,
        html: options.html // HTML body content
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;