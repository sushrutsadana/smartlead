const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

function decodeBase64(data) {
    return Buffer.from(data, 'base64').toString();
}

async function sendReply(to, subject, messageId) {
    const replyMessage = [
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        'to: ', to, '\n',
        'subject: Re: ', subject, '\n',
        'In-Reply-To: ', messageId, '\n',
        'References: ', messageId, '\n\n',
        'Thank you for contacting us. We have received your message and will get back to you soon.\n'
    ].join('');

    const encodedMessage = Buffer.from(replyMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
            threadId: messageId
        }
    });
}

async function checkNewEmails() {
    try {
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread'
        });

        const messages = res.data.messages || [];
        const processedEmails = [];

        for (const message of messages) {
            const email = await gmail.users.messages.get({
                userId: 'me',
                id: message.id
            });

            const headers = email.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find(h => h.name === 'From')?.value || '';
            const emailAddress = from.match(/<(.+)>/) ? from.match(/<(.+)>/)[1] : from;

            // Mark as read
            await gmail.users.messages.modify({
                userId: 'me',
                id: message.id,
                requestBody: {
                    removeLabelIds: ['UNREAD']
                }
            });

            // Send reply
            await sendReply(emailAddress, subject, message.id);

            processedEmails.push({
                email: emailAddress,
                subject,
                dateReceived: new Date(parseInt(email.data.internalDate)).toISOString()
            });
        }

        return processedEmails;
    } catch (error) {
        console.error('Error checking emails:', error);
        throw error;
    }
}

module.exports = {
    checkNewEmails
};
