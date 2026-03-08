# Architecture Overview

## System Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────┐
│   GitHub      │────▶│  Sentinel AI     │────▶│   OpenAI      │
│   Webhook     │     │  Express Server  │     │   GPT-4o-mini │
└──────────────┘     └──────────────────┘     └───────────────┘
                           │      │
                    ┌──────┘      └──────┐
                    ▼                    ▼
             ┌──────────────┐    ┌──────────────┐
             │   MongoDB    │    │   GitHub API  │
             │   Atlas      │    │   (Octokit)   │
             └──────────────┘    └──────────────┘
```

## How It Works

1. **User connects a repository** via the dashboard → Sentinel creates a GitHub webhook
2. **Developer opens a PR** → GitHub sends a `pull_request` event to our webhook endpoint
3. **Webhook handler** verifies the HMAC signature and extracts the event payload
4. **Webhook service** fetches the PR diff from GitHub via Octokit
5. **AI Review service** sends the diff to Gemini with a structured prompt
6. **Gemini returns** a JSON object with line-level comments and a summary
7. **GitHub service** posts the review as an inline comment on the PR
8. **Review is saved** to MongoDB for the dashboard to display

## Data Flow

```
PR Opened → Webhook → Verify Signature → Fetch Diff → Gemini AI → Save Review → Post GitHub Comments
```

## Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | React, Tailwind CSS, Vite |
| Backend    | Node.js, Express.js       |
| Database   | MongoDB (Atlas)           |
| Auth       | GitHub OAuth + JWT        |
| AI         | Google Gemini API          |
| GitHub API | Octokit                   |
| Deployment | Vercel + Render/Railway   |

## Key Design Decisions

- **Raw body for webhooks**: The webhook route uses `express.raw()` instead of `express.json()` so we can verify GitHub's HMAC-SHA256 signature against the raw request body.
- **Diff trimming**: Large diffs are trimmed to 15,000 characters to stay within token limits while still providing meaningful context.
- **JSON response format**: We use Gemini's `responseMimeType: 'application/json'` to guarantee valid JSON output from the AI.
- **Upsert pattern**: Users and PRs use upsert to handle repeated events gracefully without duplicate records.
