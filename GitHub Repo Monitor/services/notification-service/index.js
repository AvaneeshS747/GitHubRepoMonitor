const express = require('express');
const axios = require('axios');

const app = express();
// Use the express.json() middleware to automatically
// parse incoming JSON payloads
app.use(express.json());

// This is the port our service will run on.
// It's the same port we exposed in docker-compose.yml and Dockerfile.
const PORT = 8081;

// Get the Slack Webhook URL from the environment variable.
// This is securely passed in by Docker Compose from the .env file.
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// --- Security Check ---
// If the Slack URL is missing, log a fatal error and exit.
// The service is useless without it.
if (!SLACK_WEBHOOK_URL) {
    console.error('Error: SLACK_WEBHOOK_URL environment variable is not set.');
    console.error('Please create a .env file in the root directory and add SLACK_WEBHOOK_URL.');
    process.exit(1); // Exit the process with an error code
}

/**
 * This is the internal API endpoint that the 'webhook-receiver'
 * will call.
 */
app.post('/notify', async (req, res) => {
    // Extract the simple data sent from the webhook-receiver
    const { repo, user } = req.body;

    // Check if we have the data we need
    if (!repo || !user) {
        console.warn('Received incomplete notification request. Ignoring.');
        return res.status(400).send('Bad Request: Missing repo or user.');
    }

    console.log(`Notification request received for repo: ${repo} by user: ${user}`);

    // 1. Format a friendly message for Slack.
    // Slack uses 'blocks' for rich formatting.
    // You can customize this message however you like!
    const slackMessage = {
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `🚀 *New GitHub Star!* 🚀`
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": `*Repository:*\n\`${repo}\``
                    },
                    {
                        "type": "mrkdwn",
                        "text": `*Starred By:*\n\`${user}\``
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": `Way to go! 🎉`
                    }
                ]
            }
        ]
    };

    try {
        // 2. Send the message to the Slack Webhook API.
        await axios.post(SLACK_WEBHOOK_URL, slackMessage);

        console.log('Notification sent to Slack successfully.');

        // 3. Send a 200 OK response back to the webhook-receiver.
        res.status(200).send('Notification sent.');

    } catch (error) {
        console.error('Error sending notification to Slack:', error.message);
        
        // If the Slack API call fails, send a 500 error
        // back to the webhook-receiver.
        res.status(500).send('Error sending notification to Slack.');
    }
});

// Start the Express server and listen for incoming connections
app.listen(PORT, () => {
    console.log(`Notification-service listening on port ${PORT}`);
});