# Setup Guide

## Prerequisites

- **Node.js** v18+ and **npm** v9+
- **MongoDB Atlas** account (free tier works)
- **GitHub OAuth App** ([create one here](https://github.com/settings/developers))
- **OpenAI API key** ([get one here](https://platform.openai.com/api-keys))

## 1. Clone the Repository

```bash
git clone git@github.com:YOUR_USERNAME/sentinel-ai.git
cd sentinel-ai
```

## 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```bash
cp ../.env.example .env
```

Fill in the values:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `GITHUB_CLIENT_ID` | From your GitHub OAuth App settings |
| `GITHUB_CLIENT_SECRET` | From your GitHub OAuth App settings |
| `GITHUB_WEBHOOK_SECRET` | Any random string (used to verify webhooks) |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `JWT_SECRET` | Any random string for signing JWTs |
| `CLIENT_URL` | Frontend URL, default: `http://localhost:5173` |

Start the server:

```bash
npm run dev
```

The server runs on `http://localhost:5000`.

## 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` with API proxy to the backend.

## 4. GitHub OAuth App Configuration

In your GitHub OAuth App settings:
- **Homepage URL**: `http://localhost:5173`
- **Authorization callback URL**: `http://localhost:5173/auth/callback`

## 5. Testing Webhooks Locally

Use [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 5000
```

Set the ngrok URL as your webhook URL in the GitHub repo settings.
