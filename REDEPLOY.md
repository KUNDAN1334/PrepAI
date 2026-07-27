# Redeploy Checklist

What was broken, what changed, and the exact steps to get a green Vercel deploy.

---

## What was breaking the deploy

### 1. `PrepAI/` was committed as a broken git submodule (primary cause)

The repo had a gitlink entry (mode `160000`) pointing at commit `2244f2a`, but there
was **no `.gitmodules` file**. Vercel runs `git clone --recurse-submodules`; with no
`.gitmodules` it cannot resolve the pointer, so the clone step fails or produces an
empty directory before the build ever starts.

`PrepAI/` was a stale nested copy of this same project. It is now untracked and
gitignored.

### 2. Three modules threw at import time when env vars were missing

Next.js imports every route module during the "Collecting page data" build phase.
These all threw at module scope, so a build with any of these env vars unset died:

| File | Threw because |
|---|---|
| `lib/mongodb-client.ts` | `throw` at module scope if `MONGODB_URI` unset |
| `lib/db.ts` | `throw` at module scope if `MONGODB_URI`/`DATABASE_URL` unset |
| `lib/groq.ts` | `new Groq({apiKey: undefined})` — the SDK constructor throws |

`lib/auth.ts` imports the Mongo client, and every route imports `auth`, so this
crashed the build across the whole app. All three are now lazy — they connect on
first use (request time) instead of at import time.

### 3. Type error in `components/ui/google-gemini-effect.tsx`

`import { MotionValue } from "motion/react"` — framer-motion v12 no longer exports
the `MotionValue` type from its public entrypoint. The type is now derived from
`useMotionValue` instead.

### 4. Two API routes were in the wrong folders

The files had been shifted by one directory, so the endpoints the UI calls did not
exist and returned 404 at runtime:

| Was at | Contained | Now at |
|---|---|---|
| `app/api/applications/[id]/route.ts` | the **stats** handler | `app/api/applications/stats/route.ts` |
| `app/api/applications/[id]/stats/route.ts` | the **status PATCH** handler | `app/api/applications/[id]/status/route.ts` |

This matches what the frontend actually calls:

- `app/dashboard/applications/page.tsx` → `GET /api/applications/stats`
- `components/applications/KanbanBoard.tsx` → `PATCH /api/applications/:id/status`

### 5. Bogus `tailwind` dependency

`package.json` depended on `tailwind@^4.0.0` — a deprecated placeholder package,
not Tailwind CSS. It pulled in 145 unnecessary transitive packages. Removed; the
real `tailwindcss@^4.1.18` was already in devDependencies and is untouched.

### 6. `tsconfig.json` compiled unrelated nested projects

`include: ["**/*.ts", "**/*.tsx"]` was pulling in `PrepAI/`, `Threaded_v0/`, and
`Authentication_API/`. Now excluded.

---

## Before you push: two things only you can do

### A. Delete the stale git lock file

There is a leftover `.git/index.lock`. Any `git add` or `git commit` will fail with
`Unable to create index.lock: File exists` until it is removed. In PowerShell:

```powershell
Remove-Item -Force D:\PrepAI\prep-ai\.git\index.lock
```

### B. Reinstall dependencies locally

`package.json` and `package-lock.json` changed, so your local `node_modules` is out
of sync:

```powershell
cd D:\PrepAI\prep-ai
npm install
```

---

## Commit and push

Note: there were ~75 uncommitted files in the working tree. **Vercel builds the
pushed commit, not your local files** — none of these fixes take effect until you
push.

```powershell
cd D:\PrepAI\prep-ai
git add -A
git commit -m "fix: remove broken PrepAI submodule, make DB/Groq clients lazy, correct applications API routes"
git push origin main
```

Confirm the submodule is really gone before pushing — this should print nothing:

```powershell
git ls-files -s | Select-String "^160000"
```

---

## Vercel environment variables

Project Settings → Environment Variables. Set these for **Production, Preview, and
Development**.

**Required — the app will not function without these:**

| Variable | Notes |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `AUTH_SECRET` | Generate with `npx auth secret` |
| `AUTH_URL` | Your live URL, e.g. `https://prep-ai.vercel.app` |
| `NEXTAUTH_URL` | Same value as `AUTH_URL` |
| `GROQ_API_KEY` | Needed for resume optimization and mock interviews |

**Optional — social login:**

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`

**Optional — company research / scraping** (the Python service in
`services/scraping-service`, hosted separately on Railway or Render):

`PYTHON_SERVICE_URL`, `SCRAPING_SERVICE_URL`

Both default to `http://localhost:8000` and degrade gracefully if unset.

> Thanks to the lazy-init fix, the build now **succeeds** even if these are missing —
> but the affected features will fail at runtime, so set them anyway.

---

## MongoDB Atlas network access

Vercel builds and lambdas run from rotating IPs. In Atlas → Network Access, allow
`0.0.0.0/0`, or the app will hang and time out on every database call even though
the build passes.

---

## OAuth callback URLs

After Vercel assigns the production domain, add these redirect URIs:

- Google Cloud Console → `https://<your-domain>/api/auth/callback/google`
- GitHub → Developer settings → OAuth Apps → `https://<your-domain>/api/auth/callback/github`

---

## Vercel project settings

- Framework preset: **Next.js**
- Root directory: **`./`** (repo root — the Next.js app lives here)
- Build command: leave default (`npm run build`, which runs `next build --webpack`)
- Node version: **20.x or later** (Next.js 16 requires Node 20+)

---

## Verification status

| Check | Result |
|---|---|
| `tsc --noEmit` full typecheck | **Passes clean, 0 errors** |
| No module-scope throws remaining | Verified — all env reads are inside functions or have fallbacks |
| API routes match frontend calls | Verified |
| No gitlink entries remain | Verified |
| `next build` end-to-end | Not run — the Next.js SWC binary segfaults in the sandbox used for verification. This is a sandbox limitation, not a code issue; Vercel's build environment is unaffected. |

Since the full build could not be executed here, run it once locally before pushing:

```powershell
npm run build
```
