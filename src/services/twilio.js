const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function makeOutboundCall(phoneNumber) {
    try {
        const call = await client.calls.create({
            twiml: '<Response><Say>Hello, thank you for contacting us. We will get back to you soon.</Say></Response>',
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        return call.sid;
    } catch (error) {
        console.error('Error making outbound call:', error);
        throw error;
    }
}

module.exports = {
    makeOutboundCall
};
