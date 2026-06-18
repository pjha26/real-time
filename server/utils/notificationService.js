const nodemailer = require('nodemailer');
const twilio = require('twilio');
const logger = require('./logger');

// Initialize Twilio client if credentials exist
const twilioClient = process.env.TWILIO_ACCOUNTSID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNTSID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Initialize Nodemailer transporter if credentials exist
const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }) : null;

const sendEmail = async ({ to, subject, html }) => {
    if (transporter) {
        try {
            await transporter.sendMail({
                from: `"ExpertBook" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            });
            logger.info(`✅ [Real] Email sent to ${to}: ${subject}`);
        } catch (error) {
            logger.error(`❌ [Real] Failed to send email to ${to}`, error);
        }
    } else {
        // Mock email for development
        logger.info(`
=========================================
📧 [MOCK EMAIL] To: ${to}
Subject: ${subject}
-----------------------------------------
${html.replace(/<[^>]+>/g, '')} // Strip HTML for console readability
=========================================
        `);
    }
};

const sendSMS = async ({ to, body }) => {
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
            await twilioClient.messages.create({
                body,
                from: process.env.TWILIO_PHONE_NUMBER,
                to
            });
            logger.info(`✅ [Real] SMS sent to ${to}: ${body}`);
        } catch (error) {
            logger.error(`❌ [Real] Failed to send SMS to ${to}`, error);
        }
    } else {
        // Mock SMS for development
        logger.info(`
=========================================
📱 [MOCK SMS] To: ${to}
Message: ${body}
=========================================
        `);
    }
};

module.exports = {
    sendEmail,
    sendSMS
};
