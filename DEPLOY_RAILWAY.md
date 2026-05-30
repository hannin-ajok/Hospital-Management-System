# Deploying to Railway (free tier) — step-by-step

This guide shows how to deploy the app to Railway and provision a free PostgreSQL database. I will not change your app code.

Prerequisites
- A GitHub account (Railway connects to GitHub for automatic deploys)
- A Railway account (https://railway.app) — free tier is sufficient

Quick steps
1. Commit and push your repository to GitHub.
   ```bash
   git add .
   git commit -m "Add Railway deployment helpers"
   git push origin main
   ```

2. Create a new project on Railway and connect your GitHub repository.
   - Visit https://railway.app and create a new project -> "Deploy from GitHub".
   - Select your repository.

3. Add the PostgreSQL plugin in Railway.
   - In the Railway project dashboard choose "Add Plugin" -> "Postgres".
   - Railway will provision a database and expose `DATABASE_URL` automatically.

4. Set environment variables (if needed).
   - Railway will usually add `DATABASE_URL` automatically. If you need other vars, add them under Project -> Variables.
   - Recommended variables:
     - `NODE_ENV=production`
     - `PORT=5000` (Railway will set a port automatically, but keeping `PORT` is fine)
     - `JWT_SECRET` (set a secure value)

5. Deploy and view logs.
   - Railway will build and run `npm start` (Procfile or `package.json` start script used).
   - View deployment logs in the Railway dashboard.

Verify
- Health check: `https://<your-railway-url>/health/db` should return JSON indicating DB connectivity.
- Open the root URL to see the frontend served from `public/`.

Local testing
1. Copy `.env.example` to `.env` and fill values (or set `DATABASE_URL` to a local Postgres connection).
   ```bash
   cp .env.example .env
   npm install
   npm start
   ```

Notes & troubleshooting
- If Railway build fails, open build logs and check Node version and install errors.
- If the app can't connect to the DB, ensure `DATABASE_URL` is present in Railway Variables or use individual `DB_*` vars.
- Use `railway logs` in the Railway CLI for realtime logs if you install the CLI.

Want me to push these changes to GitHub and walk you through creating the Railway project? Reply "push and continue" and I'll run the git commands here.
