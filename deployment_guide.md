# Deployment Guide for OpenGravity

To ensure your bot runs stably in the cloud (Render, Railway, DigitalOcean, etc.), follow these steps:

## 1. Environment Variables
You MUST configure these variables in your cloud provider's dashboard:

| Variable | Description |
| :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Your bot token from @BotFather. |
| `TELEGRAM_ALLOWED_USER_IDS` | IDs allowed to use the bot (comma separated). |
| `GROQ_API_KEY` | Your Groq API key. |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID. |
| `FIREBASE_CLIENT_EMAIL` | service-account-email@... |
| `FIREBASE_PRIVATE_KEY` | The full private key (starting with `-----BEGIN PRIVATE KEY-----`). |

> [!IMPORTANT]
> When pasting the `FIREBASE_PRIVATE_KEY`, ensure it's the full string including the BEGIN and END markers.

## 2. Docker Cloud Deployment
The project includes a `Dockerfile`. Most cloud providers will detect it automatically.
- **Port:** Use `8080` for the health check.
- **Start Command:** `npm start` (already configured in Dockerfile).

## 3. Webhooks vs Polling
The bot is currently set to **Polling** mode.
- **Pros:** Easier to set up, works without a public URL.
- **Cons:** If you have multiple instances running (e.g., local and cloud), they will fight for messages.

> [!WARNING]
> Ensure you **DO NOT** have the bot running on your local machine if it's already running in the cloud. This is the most common reason for "unresponsiveness" (one instance steals the update and the other gets nothing).

## 4. Troubleshooting
If the bot is not responding in the cloud:
1. Check context size: I've reduced the history to 4 messages to avoid Groq token limits.
2. Check logs: My latest code adds explicit logs for Puppeteer and tool execution.
3. Restart: Always restart the service after updating environment variables.
