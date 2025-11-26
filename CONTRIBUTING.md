# Contributing to GO-TRIP

Thanks for contributing! This document contains a few guidelines to keep the repo safe and consistent.

- Branches and PRs
  - Create feature branches from `main`: `feature/your-feature` or `fix/issue-123`.
  - Open a PR with a clear title and short description. Link related issues.

- Commit messages
  - Use concise conventional-style commits, e.g. `feat: add payment webhook`, `fix(backend): handle null user`.

- Secrets and credentials
  - NEVER commit real secrets (API keys, private keys, passwords) to the repository.
  - Use `.env` for local secrets and add it to `.gitignore` (already configured).
  - Use `env.example` as a template for required variables. Fill real values only on your machine or in CI/hosting secrets.
  - If you accidentally commit a secret, rotate it immediately and remove it from git history.

- Local setup (quick)
  - Copy `env.example` to `.env` and fill in the values.
  - Backend: `cd Backend && npm install` then `npm start` or follow the README.
  - Frontend: `cd Frontend && npm install` then `npm start`.

- Tests and CI
  - We have basic GitHub Actions for Backend and Frontend. Ensure your change doesn't break CI checks before merging.

- Code style
  - Keep code readable and consistent with existing style.

If you want me to add a CONTRIBUTING checklist, PR template, or a CODE_OF_CONDUCT, tell me which you'd prefer and I'll add it.
