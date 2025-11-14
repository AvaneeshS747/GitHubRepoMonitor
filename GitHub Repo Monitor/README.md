GitHub Repo Monitor

A simple microservice-based project that sends a Slack notification every time a GitHub repository receives a new star. This project is a practical example of using webhooks, microservices, and internal/external APIs.

Core Concepts

GitHub Webhook: GitHub is configured to send an HTTP POST request to our webhook-receiver service every time a "star" event occurs.

Microservices: The application is split into two small, independent services:

webhook-receiver: A public-facing service that ingests and parses complex webhooks from GitHub.

notification-service: An internal service that formats and sends messages to Slack.

Internal API: The webhook-receiver communicates with the notification-service via a simple, internal REST API.

External API: The notification-service communicates with the outside world by sending a message to the external Slack Webhook API.

Architecture Flow

[GitHub.com] --(1. Webhook)--> [webhook-receiver] --(2. Internal API Call)--> [notification-service] --(3. External API Call)--> [Slack API]


A user stars your repo on GitHub.

GitHub sends a star event webhook to the webhook-receiver.

The webhook-receiver parses the data and calls the notification-service's internal API with simple data: { "repo": "...", "user": "..." }.

The notification-service formats a friendly message and sends it to your configured Slack channel via the Slack Webhook API.

How to Run

Prerequisites

Docker & Docker Compose

A Slack Incoming Webhook URL. See how to create one here.

ngrok (or similar tool) to expose your local webhook-receiver to the public internet.

1. Setup

Clone the repository:

git clone <your-repo-url>
cd github-repo-monitor


Create your environment file:
Create a file named .env in the root of the project (github-repo-monitor/). Add your Slack Webhook URL to it:

# .env
SLACK_WEBHOOK_URL=(URL)


2. Run the Services

Build and run both microservices using Docker Compose:

docker-compose up --build


This will build the images for both services and start them. You should see logs from both services in your terminal.

3. Expose Your Webhook Receiver

In a new terminal, use ngrok to expose your locally running webhook-receiver (which is on port 8080) to the public internet.

ngrok http 8080


ngrok will give you a public "Forwarding" URL, like https://abcdef123.ngrok.io. Copy this URL.

4. Configure GitHub Webhook

Go to your GitHub repository's Settings page.

Click on Webhooks in the sidebar.

Click Add webhook.

Payload URL: Paste your ngrok URL.

Content type: Set this to application/json.

Which events would you like to trigger this webhook?

Select "Let me select individual events."

Uncheck "Pushes" and check "Stars".

Click Add webhook.

That's it! Now, when you (or anyone else) stars that repository, you should see a message pop up in your Slack channel within seconds.

Next step?
Let's create the .env file to complete the root-level setup.