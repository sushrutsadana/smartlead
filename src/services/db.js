const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Test Supabase connection
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Supabase connection test failed:', error);
        return false;
    }
}

async function insertLead({ email, subject, dateReceived, phone = null }) {
    const { data, error } = await supabase
        .from('leads')
        .insert([
            { email, subject, dateReceived, phone, called: false }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function updateLeadCallStatus(leadId) {
    const { data, error } = await supabase
        .from('leads')
        .update({ called: true })
        .eq('id', leadId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function getLeadById(leadId) {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

    if (error) throw error;
    return data;
}

async function getAnalytics() {
    try {
        console.log('Fetching total leads...');
        const { data: totalLeads, error: totalError } = await supabase
            .from('leads')
            .select('id', { count: 'exact' });

        if (totalError) {
            console.error('Error fetching total leads:', totalError);
            throw totalError;
        }

        console.log('Fetching called leads...');
        const { data: calledLeads, error: calledError } = await supabase
            .from('leads')
            .select('id', { count: 'exact' })
            .eq('called', true);

        if (calledError) {
            console.error('Error fetching called leads:', calledError);
            throw calledError;
        }

        return {
            totalLeads: totalLeads?.length || 0,
            calledLeads: calledLeads?.length || 0
        };
    } catch (error) {
        console.error('Error in getAnalytics:', error);
        throw error;
    }
}

module.exports = {
    insertLead,
    updateLeadCallStatus,
    getLeadById,
    getAnalytics,
    testConnection
};
