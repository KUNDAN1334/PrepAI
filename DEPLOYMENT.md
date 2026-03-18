# Vercel Deployment

## 1. Push the Next.js app

This repository root (`D:\PrepAI\prep-ai`) already contains the main Next.js app, so deploy that folder as the Vercel project root.

## 2. Import into Vercel

1. Push the repo to GitHub.
2. In Vercel, click `Add New Project`.
3. Import the repository.
4. Keep the framework as `Next.js`.
5. Keep the default build settings unless you have a custom preference.

## 3. Add environment variables

Copy the keys from `.env.example` into Vercel Project Settings -> Environment Variables.

Required for the core app:

- `MONGODB_URI`
- `AUTH_SECRET`
- `GROQ_API_KEY`

Required if you want social login:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_ID`
- `GITHUB_SECRET`

Required if you want full company research/scraping:

- `PYTHON_SERVICE_URL`
- `SCRAPING_SERVICE_URL`

## 4. Important note about the Python service

The folder `services/scraping-service` is a separate Python backend. Vercel will deploy the Next.js app, but that Python service should be hosted separately on a platform like Railway or Render.

If you do not deploy the Python service:

- the main app still works
- company research will show a graceful fallback message
- scraping-heavy features will be limited

## 5. Update auth callback URLs

After Vercel gives you the production domain:

1. Set `AUTH_URL` and `NEXTAUTH_URL` to your live site URL.
2. Add that same URL to Google and GitHub OAuth callback settings.

## 6. Recommended production checklist

- Use MongoDB Atlas for the database
- Rotate any local secrets before going live
- Do not upload your real `.env` file to GitHub
- Redeploy after changing Vercel environment variables

## 7. Optional CLI deploy

If you prefer CLI:

```bash
vercel
vercel --prod
```
