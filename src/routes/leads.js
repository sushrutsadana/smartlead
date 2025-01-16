const express = require('express');
const router = express.Router();
const { checkNewEmails } = require('../services/gmail');
const { makeOutboundCall } = require('../services/twilio');
const { insertLead, updateLeadCallStatus, getLeadById } = require('../services/db');

// Route to manually check for new emails
router.get('/check-emails', async (req, res) => {
    try {
        const processedEmails = await checkNewEmails();
        
        // Store each email in the database
        const storedLeads = await Promise.all(
            processedEmails.map(email => insertLead(email))
        );

        res.json({ 
            message: `Processed ${processedEmails.length} new emails`,
            leads: storedLeads 
        });
    } catch (error) {
        console.error('Error in /check-emails:', error);
        res.status(500).json({ error: 'Failed to process emails' });
    }
});

// Route to make an outbound call to a lead
router.post('/call-lead/:id', async (req, res) => {
    try {
        const lead = await getLeadById(req.params.id);
        
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        if (!lead.phone) {
            return res.status(400).json({ error: 'Lead has no phone number' });
        }

        const callSid = await makeOutboundCall(lead.phone);
        await updateLeadCallStatus(lead.id);

        res.json({ 
            message: 'Call initiated successfully',
            callSid 
        });
    } catch (error) {
        console.error('Error in /call-lead:', error);
        res.status(500).json({ error: 'Failed to make call' });
    }
});

module.exports = router;
