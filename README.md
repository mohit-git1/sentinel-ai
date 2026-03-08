<div align="center">

# 🛡️ Sentinel AI

**AI-powered GitHub PR reviewer that catches bugs before humans do.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org)

</div>

---

## ✨ Features

- 🐛 **Bug Detection** — Catches logic errors, null references, and edge cases
- 🔒 **Security Scan** — Identifies vulnerabilities, injection risks, and auth issues
- ⚡ **Performance Tips** — Suggests optimizations for faster, leaner code
- 🎨 **Style Review** — Enforces best practices and clean code patterns
- 💬 **Inline GitHub Comments** — Posts reviews directly on your pull requests
- 📝 **Plain English Summaries** — Readable overviews of every PR's quality
- 🔄 **Automatic Triggers** — Reviews PRs as soon as they're opened or updated

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Tailwind CSS, Vite |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Atlas) |
| **Auth** | GitHub OAuth + JWT |
| **AI Engine** | NVIDIA API (microsoft/phi-4-mini-instruct) |
| **GitHub API** | Octokit |
| **Deployment** | Vercel (frontend) + Render/Railway (backend) |

---

## 📁 Project Structure

```
sentinel-ai/
├── client/                       # React frontend
│   ├── public/index.html
│   ├── src/
│   │   ├── components/           # Navbar, RepoCard, PRCard, ReviewPanel, etc.
│   │   ├── pages/                # Login, Dashboard, RepoDetail, AuthCallback
│   │   ├── hooks/useAuth.js      # Auth state management
│   │   ├── utils/api.js          # Authenticated fetch wrapper
│   │   ├── App.jsx               # Root with routing
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Tailwind + global styles
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                       # Express backend
│   ├── src/
│   │   ├── routes/               # auth, webhooks, reviews, repos
│   │   ├── controllers/          # Route logic
│   │   ├── models/               # User, Repository, PullRequest, Review
│   │   ├── services/             # aiReview, githubService, webhookService
│   │   ├── middleware/           # JWT auth, error handler
│   │   ├── config/db.js          # MongoDB Atlas connection
│   │   └── app.js                # Express app setup
│   ├── server.js                 # Entry point
│   └── package.json
│
├── docs/                         # setup, api-reference, architecture
├── tests/                        # webhook, aiReview, github tests
├── .gitignore
├── .env.example
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE
```

---

## 🔧 How It Works

```
Developer opens a PR
        │
        ▼
GitHub sends webhook ──▶ Sentinel verifies HMAC signature
                                │
                                ▼
                        Fetches PR diff via Octokit
                                │
                                ▼
                        Sends diff to NVIDIA AI
                                │
                                ▼
                        NVIDIA AI returns structured review
                        (bugs, security, performance)
                                │
                                ▼
                    Posts inline comments on the PR
                    + Saves review to MongoDB
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- GitHub OAuth App
- NVIDIA API key

### 1. Clone

```bash
git clone git@github.com:YOUR_USERNAME/sentinel-ai.git
cd sentinel-ai
```

### 2. Backend

```bash
cd server
npm install
cp ../.env.example .env    # Fill in your values
npm run dev                 # Starts on :5000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev                 # Starts on :5173
```

### 4. Environment Variables

Create a `.env` file in `server/` with:

```env
MONGODB_URI=mongodb+srv://...
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_WEBHOOK_SECRET=any_random_string
NVIDIA_API_KEY=your_nvidia_api_key
JWT_SECRET=any_random_string
CLIENT_URL=http://localhost:5173
```

See [docs/setup.md](docs/setup.md) for the full setup guide.

---

## 📚 Documentation

- [Setup Guide](docs/setup.md) — Installation & configuration
- [API Reference](docs/api-reference.md) — All endpoints with examples
- [Architecture](docs/architecture.md) — System design & data flow

---

## 🧪 Running Tests

```bash
node tests/webhook.test.js
node tests/aiReview.test.js
node tests/github.test.js
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ and NVIDIA AI**

</div>
