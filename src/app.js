const express = require('express');
const path = require('path');
const cron = require('node-cron');
const { checkNewEmails } = require('./services/gmail');
const { insertLead } = require('./services/db');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/leads', require('./routes/leads'));
app.use('/analytics', require('./routes/analytics'));

// Redirect root to analytics
app.get('/', (req, res) => {
    res.redirect('/analytics');
});

// Schedule email checking every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    try {
        console.log('Checking for new emails...');
        const processedEmails = await checkNewEmails();
        
        // Store new leads
        await Promise.all(
            processedEmails.map(email => insertLead(email))
        );

        console.log(`Processed ${processedEmails.length} new emails`);
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
