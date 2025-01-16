# Lead Management MVP

A Node.js application that automatically processes incoming emails, sends auto-replies, stores lead information in Supabase, and enables outbound calling via Twilio.

## Features

- Gmail integration for monitoring new emails
- Automatic email replies
- Lead storage in Supabase
- Outbound calling via Twilio
- Analytics dashboard
- Scheduled email checking (every 5 minutes)

## Prerequisites

1. Node.js (v14 or higher)
2. Gmail API credentials
3. Supabase account and project
4. Twilio account

## Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_key
   GMAIL_CLIENT_ID=your_gmail_client_id
   GMAIL_CLIENT_SECRET=your_gmail_client_secret
   GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
   GMAIL_USER=your_gmail_address
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   PORT=3000
   ```

3. Set up the Supabase database table:
   ```sql
   CREATE TABLE leads (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     email TEXT NOT NULL,
     subject TEXT,
     dateReceived TIMESTAMP WITH TIME ZONE NOT NULL,
     phone TEXT,
     called BOOLEAN DEFAULT FALSE
   );
   ```

4. Gmail API Setup:
   - Go to Google Cloud Console
   - Create a new project
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Use OAuth Playground to get refresh token

5. Start the application:
   ```bash
   node src/app.js
   ```

## Usage

1. View Analytics:
   - Open `http://localhost:3000/analytics`

2. Manually Check Emails:
   ```bash
   curl http://localhost:3000/leads/check-emails
   ```

3. Make Outbound Call:
   ```bash
   curl -X POST http://localhost:3000/leads/call-lead/[LEAD_ID]
   ```

## API Endpoints

- `GET /analytics` - View analytics dashboard
- `GET /leads/check-emails` - Manually trigger email check
- `POST /leads/call-lead/:id` - Make outbound call to a lead

## Automatic Email Checking

The application automatically checks for new emails every 5 minutes using a cron job. You can modify the schedule in `src/app.js`.
