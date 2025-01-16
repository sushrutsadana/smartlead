const express = require('express');
const router = express.Router();
const { getAnalytics, testConnection } = require('../services/db');

router.get('/', async (req, res) => {
    try {
        // First test the connection
        const isConnected = await testConnection();
        if (!isConnected) {
            return res.status(500).render('error', { 
                error: 'Could not connect to database. Please check your Supabase credentials.' 
            });
        }

        const analytics = await getAnalytics();
        res.render('analytics', { analytics });
    } catch (error) {
        console.error('Error in analytics route:', error);
        res.render('error', { 
            error: 'Failed to fetch analytics. Please check the server logs.' 
        });
    }
});

module.exports = router;
