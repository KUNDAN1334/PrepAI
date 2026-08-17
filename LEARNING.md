# LEARNING.md — Prep AI, end to end

Everything you need to explain this project as its author: what each file does,
how a request travels through the system, why each decision was made, and what
the alternatives were.

---

## Table of contents

1. [What the product is](#1-what-the-product-is)
2. [Stack and why each piece](#2-stack-and-why-each-piece)
3. [Repository map](#3-repository-map)
4. [Architecture in one picture](#4-architecture-in-one-picture)
5. [Data model](#5-data-model)
6. [The library layer (`lib/`)](#6-the-library-layer-lib)
7. [Request lifecycle: the six flows](#7-request-lifecycle-the-six-flows)
8. [Design decisions and trade-offs](#8-design-decisions-and-trade-offs)
9. [Security model](#9-security-model)
10. [Performance and cost](#10-performance-and-cost)
11. [Failure modes and degradation](#11-failure-modes-and-degradation)
12. [Testing](#12-testing)
13. [The Python research service](#13-the-python-research-service)
14. [Deployment](#14-deployment)
15. [Bugs that were fixed, and what they teach](#15-bugs-that-were-fixed-and-what-they-teach)
16. [Known limitations and the roadmap](#16-known-limitations-and-the-roadmap)

---

## 1. What the product is

Prep AI is a placement-preparation platform for candidates. Five features:

| Feature | What the user does | What the system does |
| --- | --- | --- |
| **Mock interview** | Picks company, role, level, type, difficulty, count | Generates questions with an LLM, grades every answer, produces a report |
| **Resume optimizer** | Uploads a PDF/DOCX + pastes a job description | Extracts text, asks the LLM for match score, ATS score, gaps, fixes |
| **Question bank** | Contributes and browses real interview questions | Full-text search, filters, one-vote-per-user voting, reputation, AI tagging |
| **Application tracker** | Logs applications, drags them across stages | Persists status history, aggregates stats on the database |
| **Company research** | Asks a question about a company | Optional Python service scrapes sources; LLM summarises; result cached 7 days |

The unifying idea: **one place that turns "I am job hunting" into a measurable
loop** — research → prepare → practise → apply → track.

---

## 2. Stack and why each piece

| Layer | Choice | Why this and not the alternative |
| --- | --- | --- |
| Framework | **Next.js 16, App Router** | One deployable for UI + API. Server Components read the database directly (no API hop for the dashboard), route handlers cover the mutations. Alternative — separate React SPA + Express — means two deployments, CORS, and duplicated auth. |
| Language | **TypeScript, `strict: true`** | The contract between API responses and components is the thing that breaks most often in this kind of app; types make it a compile error instead of `undefined` on screen. |
| Database | **MongoDB + Mongoose** | The domain is document-shaped: an interview session *contains* questions that contain an evaluation object with variable-length arrays. Modelling that relationally means five tables and joins for one screen. Mongoose adds schemas, validation and middleware (the `pre('save')` status-history hook) that the raw driver does not. |
| Auth | **Auth.js v5 (NextAuth) — JWT sessions** | Credentials + OAuth in one config. JWT rather than database sessions because the Credentials provider cannot create database sessions, and a stateless token means no extra query per request. |
| AI | **Groq (Llama 3.1 8B Instant)** | Latency and price. Grading ten answers is ten sequential LLM calls; on Groq each is sub-second, which keeps a mock interview usable. The provider is isolated behind `lib/groq.ts`, so switching to OpenAI/Anthropic is one file. |
| Styling | **Tailwind v4 + shadcn-style primitives** | The primitives are copied into `components/ui`, not imported from a package — so they can be restyled to the "editorial/brutalist" design language (hard shadows, ink borders) without fighting a library. |
| Validation | **Zod** | One schema is both the runtime guard and the TypeScript type. |
| Drag & drop | **@dnd-kit** | Accessible (keyboard support), tree-shakeable, actively maintained; `react-beautiful-dnd` is not. |
| Scraper | **FastAPI (Python)** | BeautifulSoup and the scraping ecosystem are Python-native, and scraping is slow and failure-prone — isolating it means it can be down without taking the app with it. |

---

## 3. Repository map

```
app/
  layout.tsx                     Root layout: fonts, <Providers> (SessionProvider), <Toaster>
  page.tsx                       Marketing landing page (static)
  globals.css                    Tailwind v4 theme: design tokens, status colours, animations
  (auth)/login/page.tsx          Credentials + OAuth sign-in, honours ?callbackUrl
  (auth)/register/page.tsx       Sign-up form
  dashboard/
    layout.tsx                   Shell: collapsible sidebar, top bar, sign-out
    page.tsx                     Server Component: counters, quick actions, recent interviews
    resume-optimizer/            Upload + JD, scores, keyword gaps, .md report download
    mock-interview/              Setup form
      [sessionId]/               The interview runner
      feedback/[sessionId]/      The report
    applications/                Board + table + stats
      new/, [id]/edit/           Create and edit (shared form component)
    question-bank/               List + filters + pagination
      add/, [id]/                Contribute, and a detail page with voting
    company-research/            Query form + markdown rendering of AI insights
  api/                           Every route handler — see §7

components/
  applications/                  ApplicationForm, ApplicationCard, ApplicationTable,
                                 KanbanBoard, StatsCards, types.ts (shared DTO + badge styles)
  questions/QuestionCard.tsx     Card with optimistic-free voting
  resume/FileUpload.tsx          Drag-drop + click upload with client-side validation
  landing/, auth/, ui/           Marketing pieces, auth shell, design-system primitives

lib/
  auth.ts          Auth.js config: providers, JWT/session callbacks, pages
  db.ts            Mongoose connection with a global cache
  mongodb-client.ts Lazy MongoClient promise for the Auth.js adapter
  groq.ts          Every LLM call: prompts, JSON-mode parsing, output sanitising
  http.ts          ApiError, jsonError, parseBody, withErrorHandling, escapeRegex
  api.ts           Re-exports http + requireUserId (session) + requireObjectId (mongo)
  quota.ts         Per-user rate limits with lazy period rollover
  resume-parser.ts PDF (pdf.js) and DOCX (mammoth) text extraction
  validation.ts    All Zod schemas and the shared enums the UI imports
  utils.ts         `cn()` — clsx + tailwind-merge

models/            Mongoose schemas (User, Application, Question, InterviewSession,
                   InterviewQuestion, Resume, Company)
middleware.ts      Edge redirect for /dashboard/*
types/next-auth.d.ts  Adds `user.id` to the Session type
tests/             node:test unit tests (no database required)
services/scraping-service/  FastAPI + BeautifulSoup + Groq
```

---

## 4. Architecture in one picture

```
                    ┌──────────────────────────────────────────────┐
  Browser  ───────► │ middleware.ts (Edge)                         │
                    │  /dashboard/* without a session cookie       │
                    │  → 307 /login?callbackUrl=…                  │
                    └───────────────┬──────────────────────────────┘
                                    │
             ┌──────────────────────┴───────────────────────┐
             ▼                                              ▼
   Server Components                              Route handlers (app/api/*)
   (dashboard/page.tsx)                           requireUserId() → session id
             │  direct Mongoose read                        │  parseBody() → Zod
             │                                              │  { …data, userId } write
             ▼                                              ▼
        ┌─────────────────────────── MongoDB (Mongoose) ───────────────────────────┐
        │ users · applications · questions · interviewsessions · interviewquestions │
        │ resumes · companies (TTL cache)                                           │
        └───────────────────────────────────────────────────────────────────────────┘
                                    │
                     lib/groq.ts ───┴─── Groq API (Llama 3.1)
                     fetch()     ─────── FastAPI research service (optional)
```

Two read paths on purpose:

* **Server Components** for first paint of the dashboard — no client fetch, no
  loading spinner, no API round trip. The session is read on the server with
  `auth()` and the query is issued directly.
* **Route handlers + `fetch`** for everything interactive (mutations, filtering,
  pagination, voting), because those need to re-run without a full navigation.

---

## 5. Data model

### `User`
Identity, profile, **quota** and **reputation** in one document.

```ts
quota: {
  resumeOptimizations: { dailyLimit: 5,  usedToday: 0,     lastResetDate: Date },
  mockInterviews:      { monthlyLimit: 10, usedThisMonth: 0, lastResetDate: Date },
  groqApiCalls:        { dailyLimit: 50, usedToday: 0,     lastResetDate: Date },
}
reputation: { totalPoints, badges[], questionContributions, answerContributions, bestAnswers }
```

*Why embedded?* Both are read on nearly every authenticated screen and are only
ever written by the owner — an embedded document means one read, no join, and an
atomic `$inc` for updates.

### `Application`
Owner (`userId`, indexed), company/position/status/priority, plus
`statusHistory[]` appended by a `pre('save')` hook whenever `status` changes.
The hook is the reason status changes go through `save()` and not
`findOneAndUpdate()` — middleware does not run on the latter.

### `InterviewSession` + `InterviewQuestion`
Deliberately **two collections, not one embedded array**:

* a session is written on every answer (progress, average score) while questions
  are written individually — separating them avoids rewriting a large document
  each time;
* questions carry `expectedKeyPoints` (the grading rubric) which must be
  queryable and selectively projected out of the "during the interview" response;
* 20 questions × evaluation objects would push a single document toward Mongo's
  16 MB limit far faster than needed.

`InterviewQuestion.sessionId` is indexed; the pair `(sessionId, questionNumber)`
is how the answer endpoint locates a question.

### `Question` (community bank)
Content + denormalised `upvotes`/`downvotes`/`viewCount` + a `votes[]` array of
`{ userId, voteType, votedAt }`.

*Why both?* The array is the source of truth (it is what makes "one vote per
user" enforceable and lets the UI show your own vote); the counters exist so a
list of 20 questions renders without loading thousands of vote records. The
counters are recomputed from the array on every vote, so they cannot drift.

A compound **text index** on `questionText`, `companyName`, `jobRole` powers
search with `$text` on the database rather than in Node.

### `Resume`
The uploaded text, the job description, and the analysis — kept so a user can
revisit an analysis and so the corpus is available for future features.

### `Company` (research cache)
`{ companyName, queryKey, data, scrapedAt }` with a **unique compound index** on
`(companyName, queryKey)` and a **TTL index** on `scrapedAt` (7 days). The TTL
means MongoDB evicts stale research itself — the read path never needs a date
filter and there is no cleanup job.

---

## 6. The library layer (`lib/`)

### `db.ts` — connection caching
Serverless functions are re-used between invocations, and Next.js hot-reloads
modules in development. A naive `mongoose.connect()` per request opens a new pool
every time and exhausts the cluster's connection limit. The fix is a cache on
`globalThis`:

```ts
const cached = global.mongooseCache || { conn: null, promise: null };
if (cached.conn) return cached.conn;
cached.promise ??= mongoose.connect(uri, { bufferCommands: false });
cached.conn = await cached.promise;
```

Two subtleties worth being able to explain:

* the **promise** is cached, not just the connection, so ten concurrent requests
  during a cold start share one handshake;
* `bufferCommands: false` makes queries fail fast instead of queueing invisibly
  when the connection is down.

The missing-env check lives *inside* the function, not at module scope, because
`next build` imports every route module while collecting page data — a
module-scope `throw` would break builds on machines without the env var.

### `mongodb-client.ts` — lazy client for the Auth.js adapter
The adapter wants a `Promise<MongoClient>`. Creating it eagerly has the same
build-time problem, so the export is a **thenable object** that constructs the
real promise on first `await`. It is unusual code and worth flagging as such: it
exists purely so that importing `lib/auth.ts` never opens a connection.

### `auth.ts` — Auth.js configuration
* Providers are registered **conditionally**: Google/GitHub are only added when
  both env vars exist, so a developer without OAuth apps still gets a working
  login instead of a provider that throws at request time.
* `authorize()` returns `null` for *every* failure — unknown email and wrong
  password are indistinguishable, which prevents account enumeration.
* `jwt`/`session` callbacks move the Mongo `_id` into the token and then onto
  `session.user.id`; `types/next-auth.d.ts` widens the Session type so route
  handlers can read it without casting.
* `session.strategy = 'jwt'` — required for Credentials, and it keeps request
  handling stateless.

### `http.ts` / `api.ts` — route plumbing
Every handler is wrapped:

```ts
export const POST = withErrorHandling('applications:POST', async (req) => {
  const userId = await requireUserId();          // throws ApiError(401)
  const data   = await parseBody(req, schema);   // throws ApiError(400, details)
  …
});
```

* `ApiError(status, message, details)` — intentional failures.
* `withErrorHandling` — converts `ApiError` to its status, `ZodError` to a 400,
  and anything else to a 500 that logs server-side and returns a generic message
  (no stack traces or Mongo errors leaking to the client).
* `requireObjectId` — a malformed id becomes a 400 instead of a Mongoose
  `CastError` surfacing as a 500.
* `escapeRegex` — user input is escaped before it is put in a `RegExp`; without
  it `c++` throws and `(a+)+$` is a ReDoS vector.

The split between `http.ts` (no auth/db imports) and `api.ts` exists so the unit
tests can import the transport helpers without pulling in Mongoose and the Auth.js
adapter.

### `quota.ts` — rate limiting per user
Buckets live on the user document. Rollover is **lazy**: on read, if the stored
`lastResetDate` is not in the current day/month, the counter is zeroed. No cron —
which matters because there is no always-on server to run one, and a user who
never returns never needs a reset.

Comparisons use the full date (`year+month+day`), not `getDate()`. The original
code compared day-of-month only, so 15 January and 15 February looked like "the
same day" and a monthly-idle user never got a fresh daily quota. Increments use
an atomic `$inc` rather than read-modify-write, so two concurrent requests cannot
both read `4` and both write `5`.

### `resume-parser.ts` — text extraction
* **DOCX** → `mammoth.extractRawText`.
* **PDF** → `pdfjs-dist`, the **legacy** build, because the modern build assumes
  browser globals (`DOMMatrix`, canvas) that do not exist in the Node runtime.
  The import is dynamic so the large worker bundle only loads when a PDF is
  actually uploaded. pdf.js insists on a `workerSrc` even in Node, so it is
  resolved from `node_modules` with `createRequire` — and the specifier string is
  assembled at runtime (`['pdfjs-dist', …].join('/')`) because a literal makes
  webpack try to bundle the `.mjs` worker and fail the build. `pdfjs-dist` is
  listed in `serverExternalPackages` so it stays unbundled and resolvable.
* Type detection prefers the file extension over the browser MIME type, which is
  inconsistent for DOCX.
* A PDF with no extractable text (a scan) produces a specific error telling the
  user to upload a text-based file — not a silent empty analysis.

### `groq.ts` — the only place that talks to an LLM
* The client is constructed lazily (same build-time reason as the database).
* `completeJSON()` sends `response_format: { type: 'json_object' }`, which makes
  the provider constrain decoding to valid JSON. That replaces the original
  "find the outermost braces with a regex" approach; the regex remains as a
  fallback for fenced output.
* **Model output is treated as untrusted input**: scores are clamped to their
  range, arrays are filtered to non-empty strings and length-capped, missing
  fields get defaults. A hallucinated `"score": 47` cannot reach the database.
* Inputs are truncated (`resumeText.slice(0, 12000)`) so one upload cannot blow
  the context window or the token budget.
* Failure policy is per-feature and deliberate: question generation **throws**
  (better a retry than an interview full of "Sample question 1"), tag generation
  **swallows** (a convenience must not block a contribution), and answer grading
  fails soft at the route level (see §11).

---

## 7. Request lifecycle: the six flows

### 7.1 Registration and sign-in

```
/register → POST /api/auth/register
   Zod: name ≥ 2, valid email (lowercased), password ≥ 8
   → 409 if the email exists
   → bcrypt.hash(password, 12)          cost 12 ≈ 250 ms: expensive to crack, fine to log in
   → User.create                        password hash never returned
→ /login → signIn('credentials')
   → authorize(): findOne(email) → bcrypt.compare → user | null
   → jwt callback: token.id = user.id
   → session callback: session.user.id = token.id
   → redirect to ?callbackUrl or /dashboard
```

OAuth (Google/GitHub) goes through `@auth/mongodb-adapter`, which writes
`users` / `accounts` collections with the raw driver, while `jwt` still governs
the session.

### 7.2 Dashboard first paint (Server Component)

`app/dashboard/page.tsx` runs on the server: `auth()` → `redirect('/login')` if
absent → `connectDB()` → four queries issued together with `Promise.all`
(user, completed-interview count, application count, three most recent sessions)
→ HTML. No client fetch, no spinner, no API layer in between.

### 7.3 Mock interview — the core loop

```
Setup form ──POST /api/mock-interview/create───────────────────────────┐
  Zod (numQuestions 3-20, enum'd level/type/difficulty)                │
  checkQuota('mockInterviews') → 429 with a human message if exhausted │
  generateMockInterviewQuestions() → LLM, JSON mode                    │
  InterviewSession.create(totalQuestions = questions.length)  ← the count that
  InterviewQuestion.insertMany(...)  one round trip                      was actually
      └─ on failure: delete the session (no un-startable sessions)        generated
  incrementQuota()                                                     │
  → { sessionId }                                                      │
                                                                        ▼
Runner  ──GET /api/mock-interview/[sessionId]──►  session + questions
          (expectedKeyPoints projected OUT — it is the grading rubric)
          answered flags let the runner resume where you stopped

  For every question, on "Submit & next" and on "Submit interview":
       ──PUT /api/mock-interview/[sessionId]/answer──►
            Zod: answer ≥ 50 chars
            evaluateInterviewAnswer() → score, strengths, gaps, example
            question.save()
            recount answered from the DB (re-answering cannot inflate progress)
            recompute averageScore; mark 'completed' when answered ≥ total
       ◄── { evaluation, sessionCompleted, questionsAnswered, averageScore }

Report  ──GET /api/mock-interview/[sessionId]/feedback──►
          every question with answer, evaluation, and now the rubric
          (safe to reveal once the interview is over)
```

**The most important design point in the project:** answers are submitted *per
question*, not batched at the end. The original implementation kept every answer
in React state and only ever sent the last one — so questions 1..n-1 were never
stored or graded, `questionsAnswered` stuck at 1, the session never reached
`completed`, and the feedback page was mostly empty. Per-question submission also
means an interrupted interview keeps everything answered so far, and grading
latency is spread across the session instead of a 30-second wait at the end.

### 7.4 Resume optimizer

```
Client: FormData(resume, jobDescription) ──POST /api/resume/optimize──►
  requireUserId
  file present? JD ≥ 50 chars? size ≤ 5 MB?   (client limits are convenience only)
  checkQuota('resumeOptimizations') → 429      ← checked BEFORE the expensive work
  parseResume() → pdf.js | mammoth             ← parse errors are 400, not 500
  optimizeResume() → LLM → clamped, sanitised analysis
  Resume.create(...)
  incrementQuota()
◄── { resumeId, analysis, quota: { remaining, limit } }
Client renders the scores and can download a Markdown report built in the browser
(Blob + object URL — no server round trip, and the URL is revoked afterwards).
```

`multipart/form-data`, so the route uses `req.formData()` and the client must
**not** set a `Content-Type` header — the browser has to add the multipart
boundary itself.

### 7.5 Application tracker

```
GET  /api/applications            list, .lean(), sorted by date
POST /api/applications            Zod-validated create; { …data, userId } — userId LAST
GET  /api/applications/stats      $facet aggregation: counts by status, by priority,
                                  total, and the 5 most recent — one round trip
GET|PUT|DELETE /api/applications/[id]     ownership is part of the query filter
PATCH /api/applications/[id]/status       one-field write for drag-and-drop
```

The board (`KanbanBoard`) uses `@dnd-kit`: columns register with `useDroppable`,
cards with `useDraggable`, and only the grip handle carries the drag listeners so
the Edit / Job-post buttons stay clickable. A drop issues the PATCH and then
**refetches** — deliberately not optimistic, so what you see is always what the
database accepted. `PointerSensor` has an 8 px activation distance so a tap is
not read as a drag.

`{ ...data, userId }` with `userId` written **last** matters: the original code
was `{ userId: session.user.id, ...body }`, which let a client send
`{"userId": "<someone else's id>"}` and have the spread overwrite the server's
value. The Zod schema also strips unknown keys, so both layers stop it.

### 7.6 Question bank and company research

```
GET  /api/questions          public; $text search + escaped-regex filters + pagination
                             anonymous contributions have their contributor stripped
POST /api/questions          auth; validated; tags via LLM only when none supplied;
                             atomic $inc on the contributor's reputation
GET  /api/questions/[id]     findOneAndUpdate($inc viewCount) — read and count in one trip;
                             returns only *your* vote, never everyone's voting history
POST /api/questions/[id]/vote   one vote per user, toggleable, counters recomputed;
                                self-voting rejected

GET /api/research/company    auth → cache lookup (companyName, queryKey)
                             → hit: served from Mongo (TTL-expired entries are gone already)
                             → miss: FastAPI service with a 55 s AbortSignal timeout
                                 → success: cache and return
                                 → failure: return curated source links, do NOT cache
```

---

## 8. Design decisions and trade-offs

**Server Components for reads, route handlers for writes.** The dashboard's first
paint needs no JavaScript and no waterfall; interactive screens need endpoints
they can re-call. Using both is the point of the App Router — the cost is that
you must always know which side a file runs on.

**Validate at the boundary with Zod, never spread a request body into a model.**
One schema per endpoint gives runtime safety, TypeScript types, and field-level
error messages the UI can display. The alternative — trusting Mongoose schema
validation — allows any field the schema happens to define, which is exactly how
the `userId` overwrite bug existed.

**Quota in the user document, not Redis.** The app already reads the user on
authenticated requests, limits are per-user and low-frequency, and adding Redis
would mean another service to run and pay for. If limits ever needed to be
per-IP, per-minute or shared across instances, Redis with a sliding window would
be the right move — this is a scale-appropriate choice, not a permanent one.

**Two collections for interviews.** See §5. Embedding is fine until documents are
written on every interaction and carry rubric data you sometimes need to hide.

**Denormalised vote counters with the array as source of truth.** Classic
read-vs-write trade-off: writes do slightly more work (recount from the array),
reads get one document instead of a join.

**TTL index for the research cache.** Expiry as a database property rather than
application logic — no date filters in queries, no cleanup job, no risk of a
forgotten branch serving stale data.

**Provider isolation for the LLM.** All prompts and parsing live in `lib/groq.ts`
behind typed functions. Swapping providers, or adding a retry/fallback model, is
a change to one file with no route touched.

**Cookie-presence check in middleware, real auth in every handler.** Middleware
runs on the Edge runtime, where Mongoose cannot run — so it does the cheap thing
(is there a session cookie?) purely to avoid flashing an empty dashboard, and the
authoritative check (`requireUserId()` + owner-scoped queries) happens in every
route handler and in the dashboard Server Component. A forged cookie gets you a
shell that immediately 401s.

**Degrade, don't fail.** Research without the Python service returns curated
links; an ungraded answer is still saved and shown with its rubric. A prep tool
that shows *something useful* beats one that shows an error.

---

## 9. Security model

| Concern | Control |
| --- | --- |
| Password storage | bcrypt, cost 12; the hash is never returned by any endpoint |
| Account enumeration | `authorize()` returns `null` identically for unknown email and wrong password |
| Session | Signed JWT (`AUTH_SECRET`), 30-day max age, `httpOnly` cookie managed by Auth.js |
| Authorisation | Ownership is part of the **query filter** (`findOne({ _id, userId })`), so another user's row is "not found" and leaks nothing |
| Mass assignment | Zod schemas whitelist fields; server-owned fields (`userId`, `contributorId`) are written after the spread |
| Injection | Mongoose casts values; user input in regexes goes through `escapeRegex` (ReDoS + invalid-pattern crashes) |
| IDOR / malformed ids | `requireObjectId` → 400 before the query |
| Rate limiting / cost control | Per-user quotas checked before any LLM call, 429 with a clear message |
| Data exposure | `expectedKeyPoints` (rubric) projected out during an interview; other users' votes never sent; anonymous contributors stripped from populated results |
| Error leakage | `withErrorHandling` logs details server-side, returns a generic 500 |
| Upload safety | Extension + MIME + size checks server-side; parse failures are 400s |
| Secrets | `.env.local` is gitignored; `.env.example` documents the keys |

Honest gaps to name before an interviewer does: no CSRF token on route handlers
beyond Auth.js's own protection, no email verification, no per-IP throttle on
`/api/auth/register`, no virus scanning of uploads, and resume text is stored in
plaintext in MongoDB.

---

## 10. Performance and cost

* **Connection reuse** — cached Mongoose connection and cached connect promise
  (§6) keep a serverless deployment from exhausting the cluster's pool.
* **`.lean()` on read-only queries** — plain objects instead of hydrated
  documents; less CPU and memory per list request.
* **Aggregation over application-side counting** — `/api/applications/stats` uses
  a single `$facet` pipeline. The original loaded every application into Node and
  ran seven `Array.filter` passes; that is O(n) transfer per dashboard load and
  degrades as a user's history grows.
* **`insertMany`** for generated questions — one round trip instead of twenty.
* **Indexes** — `userId` on applications and sessions, `sessionId` on questions,
  a compound text index for search, unique `(companyName, queryKey)` on the cache.
* **Pagination** — the question bank pages at 20 with `skip`/`limit` and returns
  `hasMore`.
* **Debounced filters** — search and company inputs settle for 350 ms, turning a
  request-per-keystroke into one request per pause.
* **Token discipline** — prompt inputs are truncated; `max_tokens` is set per call.
* **Research caching** — a repeated (company, question) pair costs one database
  read instead of a scrape plus an LLM call.
* **Deliberate non-optimisation** — the Kanban board refetches after a drop
  instead of updating optimistically. Two requests, but no chance of the UI
  showing a state the server rejected.

---

## 11. Failure modes and degradation

| Failure | Behaviour |
| --- | --- |
| Groq down during question generation | 502 with a retry message; no session is created; quota is not consumed |
| Groq down during answer grading | **The answer is still saved.** The response carries `evaluationError`, the UI toasts "saved, grading unavailable", and the report shows the answer with its expected key points instead of a score |
| Groq down during tag generation | Falls back to `['interview']`; the contribution succeeds |
| Python research service down/slow | 55 s `AbortSignal` timeout, then curated source links; the failure is **not** cached |
| MongoDB unreachable | `bufferCommands: false` → fast failure → generic 500 JSON; no hanging request |
| Question insert fails mid-create | The session is deleted so no un-startable interview is left behind |
| Malformed id in a URL | 400, not a 500 from a Mongoose CastError |
| Quota exhausted | 429 with the limit, the period, and when it resets |
| User closes the tab mid-interview | Everything already submitted is graded and stored; reopening resumes at the first unanswered question |

---

## 12. Testing

`npm test` runs Node's built-in test runner through `tsx` — no database, no
network, no test framework dependency:

* **Quota date maths** — the exact bug that made rollover wrong (day-of-month
  and month-index comparisons).
* **`escapeRegex`** — `c++` no longer throws, `(a+)+$` is neutralised.
* **Zod schemas** — an injected `userId`/`upvotes` is stripped; invalid statuses,
  out-of-range question counts and short answers are rejected; the profile schema
  refuses `email`, `password` and `quota`.
* **`parseBody`** — invalid JSON and schema failures both become `ApiError(400)`.
* **Resume parsing** — real PDF and DOCX fixtures are extracted end to end, and
  an unsupported type is rejected.

What is deliberately not unit-tested: route handlers and Mongoose queries, which
need a database (the honest next step is `mongodb-memory-server` for integration
tests plus Playwright for the interview flow). Being able to say *which* tests
are missing and why is worth more in an interview than claiming full coverage.

---

## 13. The Python research service

`services/scraping-service/main.py` — FastAPI with three concerns:

1. `GET /research/company?company=&query=&platforms=` — scrapes GeeksforGeeks
   (BeautifulSoup, browser-like headers, randomised delays), assembles LeetCode
   and Medium source links, builds a context block, and asks Groq for a markdown
   preparation guide.
2. `GET /health` — reports whether Groq is configured; used by the host's probes
   and to confirm `PYTHON_SERVICE_URL` points somewhere real.
3. CORS — origins come from `ALLOWED_ORIGINS`, so a new frontend deployment does
   not require a code change.

Why a separate service at all: scraping is slow (seconds), fragile (markup
changes), and Python has the better toolchain for it. Isolating it means the
Next.js app has one well-defined dependency it can survive losing.

Fixed here: `requirements.txt` was UTF-16 encoded with duplicate, conflicting
pins for `fastapi`/`uvicorn`/`requests` and **no `groq` entry at all** even though
`main.py` imports it — a container built from that file crashed on import. The
Dockerfile now honours the platform's `$PORT`.

---

## 14. Deployment

**Next.js app** (Vercel or any Node host): set `MONGODB_URI`, `AUTH_SECRET`,
`AUTH_URL` (the deployed origin), `GROQ_API_KEY`, optionally the OAuth pairs and
`PYTHON_SERVICE_URL`. `npm run build` → `npm start`.

**Research service**: any Docker host (Railway, Render, Fly.io). Set
`GROQ_API_KEY` and `ALLOWED_ORIGINS`; point the app's `PYTHON_SERVICE_URL` at it.

**MongoDB Atlas**: allow the platform's egress IPs (or `0.0.0.0/0` for a
serverless host that has no stable egress range) and use a least-privilege user.

Routes that touch the session are marked `dynamic = 'force-dynamic'` so Next never
tries to prerender per-user data; AI routes set `maxDuration = 60` because
generation and grading exceed the default function limit.

---

## 15. Bugs that were fixed, and what they teach

These are the strongest interview material in the project — each one is a real
symptom with a root cause and a fix.

| # | Bug | Root cause | Fix | Lesson |
| --- | --- | --- | --- | --- |
| 1 | Only the **last** interview answer was ever saved or graded | Answers accumulated in React state; a single request at the end | Submit each answer as the candidate advances; recount progress from the database | Client state is not persistence |
| 2 | Sessions never reached `completed`, `averageScore` stayed empty | Follows from #1 | Recompute both from stored answers on every submission | Derive state from the store, not from a counter you hope stayed in sync |
| 3 | Anyone could create applications **owned by another user** | `{ userId, ...body }` — the spread overwrote the server value | Zod whitelist + `{ ...data, userId }` | Never spread a request body into a model |
| 4 | Stats tiles showed blank | API returned `{ byStatus: {...} }`, the component expected `{ pending, offers, rejected }` | Shared, typed DTO; API returns exactly what the component reads | Contracts between layers belong in types |
| 5 | Kanban drag-and-drop did nothing | Columns were never registered with `useDroppable`, cards never with `useDraggable`, so `over` was always `null` | Proper dnd-kit wiring with a dedicated grip handle | A library imported is not a library used — verify the interaction |
| 6 | PDF resumes rejected outright | `parsePDF` threw by design after a bundling problem | pdf.js legacy build + runtime-assembled worker specifier + `serverExternalPackages` | "Disable the feature" is a workaround, not a fix |
| 7 | Quotas existed but were never enforced | `checkQuota`/`incrementQuota` were never called | Enforced before every LLM call; 429 with remaining/limit | Dead code is a promise the product is not keeping |
| 8 | Daily/monthly resets fired at the wrong time | `getDate()`/`getMonth()` compared without the year | Full date comparison, unit-tested | Date maths deserves tests |
| 9 | Malformed ids returned 500 | Mongoose `CastError` escaped to the generic handler | `requireObjectId` → 400 | Validate identifiers at the boundary |
| 10 | `new RegExp(userInput)` in search | Unescaped input | `escapeRegex` | ReDoS and crashes from ordinary input like `c++` |
| 11 | Broken links to `/dashboard/mock-interview/setup`, `/mock-interview/history`, and two different application-edit URLs | Routes that never existed | Links point at real routes; the edit page now exists | Every link is a contract |
| 12 | Dead "Delete" and "Download report" buttons | Handlers were never written | Delete with a confirm dialog + `DELETE` endpoint; report built as a Blob | Ship no button that does nothing |
| 13 | Profile was read-only although `PUT /api/user/profile` existed | The form never called it | Editable form wired to the endpoint; the endpoint whitelists fields | Orphan endpoints rot |
| 14 | `middleware.ts` protected nothing (it returned `next()` on every path) | Placeholder never finished | Real cookie check + `callbackUrl` redirect, with handler-level auth as the true boundary | A guard that always says yes is worse than none — it creates false confidence |
| 15 | `delete mongoose.models.X` before every model definition | Attempt to dodge hot-reload `OverwriteModelError` | `mongoose.models.X \|\| mongoose.model(...)` | Understand the framework's caching instead of fighting it |
| 16 | Python container crashed on import | `requirements.txt` was UTF-16, had conflicting duplicate pins, and omitted `groq` | Rewritten UTF-8 file with one pin per package | Dependency manifests are code |
| 17 | LLM JSON parsed by regex-hunting for braces | No structured-output mode used | `response_format: json_object` + sanitising + clamping | Treat model output as untrusted input |
| 18 | Repo clutter: `DEPLOYMENT.md`, `REDEPLOY.md`, `verce.json` (a typo'd, invalid Vercel config), a duplicated `components/dashboard/**` copy of four pages, unused UI components and 14 unused dependencies | Accumulated during deployment firefighting | Removed; one `README.md` plus these two documents | Deleting code is a contribution |

---

## 16. Known limitations and the roadmap

**Limitations to state plainly**

* No integration or end-to-end tests (unit tests only).
* Grading is one LLM call per answer with no rubric calibration — scores are
  directionally useful, not standardised.
* Scraping GeeksforGeeks is brittle by nature and returns little without a
  proper search API.
* No email verification or password reset.
* Quotas are per user, not per IP, so registration itself is unthrottled.
* The board refetches after every drop (correctness over snappiness).

**What I would build next, in order**

1. Integration tests against `mongodb-memory-server` + a Playwright pass over the
   interview flow.
2. Streaming feedback (`ReadableStream`) so a score appears token by token.
3. Answer-level retry: a "regrade" button for answers that failed evaluation.
4. Redis (Upstash) for shared rate limiting and hot-path caching if traffic grows.
5. A vector store over stored resumes and questions, to recommend questions that
   target a candidate's actual gaps.
6. Voice mock interviews (Web Speech API → transcript → the same grading path).
