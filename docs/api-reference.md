# API Reference

Base URL: `http://localhost:5000/api`

## Authentication

### `GET /auth/github`
Redirects the user to GitHub's OAuth consent screen.

### `GET /auth/github/callback?code=<auth_code>`
Exchanges the GitHub auth code for a JWT token.

**Response:**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "65f...",
    "username": "octocat",
    "avatarUrl": "https://avatars.githubusercontent.com/..."
  }
}
```

### `GET /auth/me`
Returns the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

---

## Repositories

All repository endpoints require `Authorization: Bearer <token>`.

### `GET /repos`
List all connected repositories for the authenticated user.

### `POST /repos/connect`
Connect a GitHub repository and create a webhook.

**Body:**
```json
{
  "repoName": "hello-world",
  "fullName": "octocat/hello-world"
}
```

### `DELETE /repos/:id`
Disconnect a repository and remove its webhook.

### `GET /repos/:id/pulls`
List pull requests for a specific repository.

---

## Reviews

All review endpoints require `Authorization: Bearer <token>`.

### `GET /reviews/pr/:prId`
Get all AI reviews for a specific pull request.

### `GET /reviews/:id`
Get a single review by its ID.

### `POST /reviews/trigger/:prId`
Manually trigger an AI review for a pull request.

**Response:**
```json
{
  "_id": "65f...",
  "prId": "65f...",
  "summary": "Overall clean PR with one potential null reference bug...",
  "comments": [
    {
      "file": "src/utils.js",
      "line": 42,
      "issue": "Potential null reference when user.profile is undefined",
      "suggestion": "Add optional chaining: user?.profile?.name",
      "type": "bug"
    }
  ],
  "createdAt": "2026-03-05T10:00:00Z"
}
```

---

## Webhooks

### `POST /webhooks/github`
Receives GitHub webhook events. Automatically triggered by GitHub when a PR is opened or updated.

**Headers:** `X-Hub-Signature-256`, `X-GitHub-Event`

---

## Health Check

### `GET /health`
Returns server status.

```json
{ "status": "ok", "service": "sentinel-ai" }
```
