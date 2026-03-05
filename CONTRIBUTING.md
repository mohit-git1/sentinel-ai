# Contributing to Sentinel AI

Thank you for your interest in contributing! Here's how to get started.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone git@github.com:YOUR_USERNAME/sentinel-ai.git
   cd sentinel-ai
   ```
3. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. **Install dependencies** for both client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
5. **Set up environment variables** — copy `.env.example` to `.env` in the `server/` directory and fill in your values.

## Development Workflow

- Run the backend: `cd server && npm run dev`
- Run the frontend: `cd client && npm run dev`
- Write tests for new features in the `tests/` directory.

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix   | Use Case                         |
|----------|----------------------------------|
| `feat:`  | New feature                      |
| `fix:`   | Bug fix                          |
| `docs:`  | Documentation changes            |
| `style:` | Code formatting (no logic change)|
| `refactor:` | Code restructuring            |
| `test:`  | Adding or updating tests         |
| `chore:` | Build scripts, CI, tooling       |

**Examples:**
```
feat: add inline GitHub comment posting
fix: handle empty diff in webhook payload
docs: update API reference with review endpoint
```

## Pull Request Process

1. Ensure your code runs without errors.
2. Write or update tests if applicable.
3. Update documentation if you changed any API or behavior.
4. Open a Pull Request against the `main` branch.
5. Describe your changes clearly in the PR description.
6. Wait for a review — we'll get back to you promptly!

## Code Style

- Use **plain JavaScript** (`.js` / `.jsx`) — no TypeScript.
- Use **Tailwind CSS** utility classes in React components.
- Add comments for non-obvious logic.
- Keep functions small and focused.

## Reporting Issues

Open an issue on GitHub with:
- A clear title and description
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
