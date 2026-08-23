<p align="left">
  <img src="public/logo-lockup.png" alt="PrepAI" width="300">
</p>

An AI-assisted placement preparation platform: mock interviews with per-answer
grading, resume ↔ job-description analysis, a community question bank, an
application tracker, and company research.

Built with Next.js 16 (App Router), TypeScript, MongoDB/Mongoose, Auth.js v5,
Tailwind v4 + shadcn-style components, and Groq (Llama 3.1) for every AI call.
An optional FastAPI service scrapes public interview experiences.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in MONGODB_URI, AUTH_SECRET, GROQ_API_KEY
npm run dev                    # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (`node --test`, no database needed) |

### Required environment variables

| Variable | Why |
| --- | --- |
| `MONGODB_URI` | Mongo connection string (`DATABASE_URL` also accepted) |
| `AUTH_SECRET` | Signs the session JWT — `openssl rand -base64 32` |
| `GROQ_API_KEY` | Resume analysis, interview generation and grading |

Optional: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `GITHUB_ID` /
`GITHUB_SECRET` (OAuth providers are only registered when their pair is present),
`GROQ_MODEL`, `PYTHON_SERVICE_URL`.

---

## Layout

```
app/
  (auth)/login, (auth)/register     Auth screens
  api/                              Route handlers (the entire backend)
  dashboard/                        Product screens
components/
  brand/Logo.tsx                    The logo — mark, wordmark and lockup (single source of truth)
  ...                               applications, questions, resume, landing, ui primitives
lib/                                auth, db, groq, http/api helpers, quota, resume parsing, validation
models/                             Mongoose schemas
services/scraping-service/          Optional FastAPI research service
tests/                              Unit tests for the pure logic
```

`LEARNING.md` is the full technical walkthrough (every flow, every design
decision). `INTERVIEW.md` prepares you to defend the project in an interview.

---

## Brand

The mark is a **P whose stem doubles as a rising arrow** — preparation turning
into progress — set in a rounded ink badge with the letter's counter picked out
in crimson. It is drawn on a 40×40 grid from three paths, so it stays crisp from
a 16px favicon to a hero lockup.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#141210` | Badge, glyph on light surfaces |
| Paper | `#FFFFFF` | Glyph on ink, badge on dark surfaces |
| Crimson | `#E8174A` | The counter, and `AI` in the wordmark |

Import from `components/brand/Logo.tsx` — never hand-roll a mark:

```tsx
import Logo, { LogoMark, Wordmark } from '@/components/brand/Logo';

<Logo />                                   // lockup, ink badge (default)
<Logo size="lg" variant="paper" />         // white badge + hard ink rule
<Logo variant="onDark" />                  // for the sidebar and ink sections
<LogoMark variant="mono" className="h-5 w-5" />   // inherits currentColor
```

Static assets live in `public/`: `logo-mark.svg`, `logo-mark-paper.svg`,
`logo-mark-mono.svg`, `logo.svg` (lockup), `logo.png`, `logo-lockup.png` and
`og-image.png`. Favicons are served from the app dir (`app/favicon.ico`,
`app/icon.svg`, `app/apple-icon.png`).

Every asset is regenerated from one geometry definition in
`scripts/build-brand-assets.py` — edit the mark there, never by hand:

```bash
python3 scripts/build-brand-assets.py
```

---

## Optional research service

```bash
cd services/scraping-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000     # then set PYTHON_SERVICE_URL=http://localhost:8000
```

Without it, company research degrades to curated source links instead of failing.

---

## Deployment

Deploy the Next.js app anywhere that runs Node (Vercel being the obvious choice):
set the environment variables above, point `AUTH_URL` at the deployed origin, and
add the deployed URL to `ALLOWED_ORIGINS` on the Python service if you run one.
