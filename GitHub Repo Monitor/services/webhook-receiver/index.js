const express = require('express');
const axios = require('axios');

const app = express();
// Use the express.json() middleware to automatically
// parse incoming JSON payloads from GitHub
app.use(express.json());

// This is the port our service will run on.
// It's the same port we exposed in docker-compose.yml and Dockerfile.
const PORT = 8080;

// Get the internal URL of our notification-service from the
// environment variable we defined in docker-compose.yml
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;

if (!NOTIFICATION_SERVICE_URL) {
    console.error('Error: NOTIFICATION_SERVICE_URL environment variable is not set.');
    process.exit(1); // Exit the process with an error code
}

/**
 * This is the main endpoint that will receive the webhook from GitHub.
 * We'll configure GitHub to send POST requests to '/'
 * (or '/webhook', '/github', etc. - but '/' is simplest for this).
 */
app.post('/', async (req, res) => {
    console.log('Webhook received from GitHub...');

    // Extract the data from the GitHub payload.
    // We only care about "star" events, specifically when one is "created".
    const { action, repository, sender } = req.body;

    // Check if it's a "new star" event.
    // GitHub sends 'created' when starred and 'deleted' when un-starred.
    if (action === 'created' && repository && sender) {
        const repoName = repository.name;
        const userName = sender.login; // This is the GitHub username

        console.log(`Star created for repo: ${repoName} by user: ${userName}`);

        try {
            // This is the "Internal API Call"
            // We send a POST request to our *other* microservice.
            await axios.post(NOTIFICATION_SERVICE_URL, {
                repo: repoName,
                user: userName
            });

            console.log('Notification request forwarded to notification-service.');

            // Send a 200 OK response back to GitHub to let it know
            // we successfully received the webhook.
            res.status(200).send('Webhook received and forwarded.');

        } catch (error) {
            console.error('Error forwarding webhook to notification-service:', error.message);
            // If our internal service is down, let GitHub know there was a problem.
            res.status(500).send('Error forwarding webhook.');
        }

    } else {
        // If it's not a 'created' star event (e.g., 'deleted' or a different event type),
        // just log it and respond peacefully.
        console.log(`Received non-star-creation event (action: ${action}). Ignoring.`);
        res.status(202).send('Event received but not processed.');
    }
});

// Start the Express server and listen for incoming connections
app.listen(PORT, () => {
    console.log(`Webhook-receiver service listening on port ${PORT}`);
    console.log(`Forwarding notifications to: ${NOTIFICATION_SERVICE_URL}`);
});