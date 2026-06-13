require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generic function to send SMS
const sendSMS = async (to, body) => {
    try {
        if(process.env.NODE_ENV === 'production' ){
            console.log("this is under production environment, SMS sending is disabled for testing purposes.");
            return null;
        }

        // Automatically prepend +91 for 10-digit Indian numbers if no country code is provided
        let formattedTo = to.trim();
        if (/^\d{10}$/.test(formattedTo)) {
            formattedTo = '+91' + formattedTo;
        }

        const message = await client.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedTo
        });
        console.log(`SMS sent successfully to ${formattedTo}. Message SID: ${message.sid}`);
        return message;
    } catch (error) {
        console.error(`Error sending SMS to ${to}:`, error.message || error);
        throw error; // Throw error so controller can return proper failure message to frontend
    }
};

// Specific function for transaction notifications
const sms_payment_notification = async (to, name, amount, otherAccount, isSender) => {
    if (!to) return; 
 if(process.env.NODE_ENV === 'production' ){
            return console.log("this is under production environment, SMS sending is disabled for testing purposes.");
          }


    const body = isSender
        ? `Dear ${name}, your payment of ${amount} INR to account ${otherAccount} has been successfully sent. - The Banking Team`
        : `Dear ${name}, you have received a payment of ${amount} INR from account ${otherAccount}. - The Banking Team`;

    await sendSMS(to, body);
};

module.exports = { sendSMS, sms_payment_notification };