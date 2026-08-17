# INTERVIEW.md — Owning Prep AI in an interview

This is your preparation file. It covers how interviewers will evaluate a project
like this, what you must be able to say without hesitating, and answers you can
adapt in your own words.

Read `LEARNING.md` first for the technical detail. This file turns that detail
into interview performance.

---

## Table of contents

1. [How you will be evaluated](#1-how-you-will-be-evaluated)
2. [The 60-second pitch](#2-the-60-second-pitch)
3. [The three-minute walkthrough](#3-the-three-minute-walkthrough)
4. [Must-know facts (recall these instantly)](#4-must-know-facts-recall-these-instantly)
5. [Stories that win interviews](#5-stories-that-win-interviews)
6. [Q&A — project and architecture](#6-qa--project-and-architecture)
7. [Q&A — Next.js and React](#7-qa--nextjs-and-react)
8. [Q&A — database and MongoDB](#8-qa--database-and-mongodb)
9. [Q&A — authentication and security](#9-qa--authentication-and-security)
10. [Q&A — AI integration](#10-qa--ai-integration)
11. [Q&A — performance, scale and cost](#11-qa--performance-scale-and-cost)
12. [Q&A — testing and quality](#12-qa--testing-and-quality)
13. [Q&A — behavioural, with STAR answers](#13-qa--behavioural-with-star-answers)
14. [Whiteboard scenarios: "how would you extend it?"](#14-whiteboard-scenarios-how-would-you-extend-it)
15. [Traps and how to escape them](#15-traps-and-how-to-escape-them)
16. [Questions to ask them](#16-questions-to-ask-them)
17. [Your prep plan](#17-your-prep-plan)

---

## 1. How you will be evaluated

When an interviewer opens a personal project, they are testing six things:

| What they assess | The question behind the question | How you win it |
| --- | --- | --- |
| **Ownership** | Did you build this, or assemble it from tutorials? | Explain *why* each choice was made and what you rejected |
| **Depth** | Can you go three levels down? | Follow every "what" with a "because", and know the failure modes |
| **Judgement** | Do you understand trade-offs? | Name the alternative and the cost of your choice |
| **Debugging** | What happens when it breaks? | Tell bug stories: symptom → hypothesis → root cause → fix → prevention |
| **Production sense** | Have you thought past the happy path? | Auth, validation, quotas, degradation, error handling |
| **Honesty** | Do you know your gaps? | State limitations before they find them, with your plan |

The most common failure is a candidate who can demo the app but cannot explain
one line of it. The second most common is claiming everything is perfect. Both
are avoidable with this file.

**The single line to keep in your head:** *"I can explain every decision in this
codebase, including the ones I would make differently now."*

---

## 2. The 60-second pitch

> "Prep AI is a placement-preparation platform I built with Next.js 16,
> TypeScript and MongoDB. It does five things: AI mock interviews where every
> answer is graded individually, resume-to-job-description analysis with a match
> and ATS score, a community question bank with voting and reputation, an
> application tracker with a drag-and-drop pipeline, and company research.
>
> The interesting parts aren't the CRUD — they're the constraints. Every AI call
> is metered by a per-user quota so cost can't run away, model output is treated
> as untrusted input and sanitised before it touches the database, and every
> feature degrades instead of failing: if grading is unavailable, your answer is
> still saved and shown against the rubric.
>
> It's about ten thousand lines across roughly twenty API routes and seven Mongo
> collections, and I've fixed some genuinely instructive bugs in it — the best one
> being that only the last interview answer was ever actually saved."

Practise this out loud until it takes 55–65 seconds. Then stop talking and let
them pick a thread.

---

## 3. The three-minute walkthrough

If they say "walk me through the architecture", draw this and narrate it:

```
Browser
  │
  ├─ middleware.ts (Edge)  → /dashboard/* with no session cookie → /login?callbackUrl=…
  │
  ├─ Server Components     → dashboard reads Mongo directly (no API hop, no spinner)
  │
  └─ Route handlers        → requireUserId() → Zod → owner-scoped Mongo write
                                │
                                ├─ lib/groq.ts  → Groq (Llama 3.1), JSON mode
                                └─ fetch        → FastAPI research service (optional)
```

Narration, in order:

1. **Two read paths, on purpose.** Server Components for first paint; route
   handlers for anything interactive.
2. **Every handler is wrapped** by `withErrorHandling`, so auth is a 401, bad
   input is a 400 with field errors, and anything unexpected is a logged 500 with
   a generic message.
3. **Ownership is in the query**, not an `if` afterwards: `findOne({ _id, userId })`.
4. **The LLM lives behind one module.** Prompts, JSON-mode parsing and clamping
   are in `lib/groq.ts`; swapping providers is a one-file change.
5. **Quotas gate every AI call**, checked before the expensive work.
6. **Degradation is designed**, not accidental — I can walk through three
   examples.

---

## 4. Must-know facts (recall these instantly)

**Scale**: ~10k lines, 7 Mongoose models, ~20 route handlers, 12 dashboard
screens, 14 unit tests.

**Stack**: Next.js 16 App Router · TypeScript strict · MongoDB + Mongoose ·
Auth.js v5 (JWT sessions) · Groq Llama 3.1 8B Instant · Tailwind v4 + shadcn-style
primitives · Zod · @dnd-kit · FastAPI side service.

**Collections**: `users`, `applications`, `questions`, `interviewsessions`,
`interviewquestions`, `resumes`, `companies` (TTL cache).

**Numbers**: bcrypt cost 12 · answer minimum 50 chars server-side (100 in the UI)
· 3–20 questions per interview · 5 resume analyses/day · 10 mock interviews/month
· research cached 7 days · question bank pages at 20 · 55 s timeout on the Python
service · `maxDuration = 60` on AI routes · 5 MB upload cap.

**Five things I would say are non-obvious in this codebase**
1. Per-question answer submission (not batched) — correctness *and* resilience.
2. `expectedKeyPoints` is projected out during the interview, revealed in the report.
3. TTL index on the research cache — expiry as a database property.
4. Votes stored as an array (source of truth) plus denormalised counters (read speed).
5. Middleware is a redirect, not an authorisation boundary — and I can say why.

---

## 5. Stories that win interviews

Have these three ready. Each is 90 seconds, structured as
**symptom → investigation → root cause → fix → prevention**.

### Story A — "Only the last answer was ever saved" (the flagship)

> **Symptom.** Finish a ten-question mock interview, land on the feedback page,
> and nine questions show no answer and no score. The session also stays
> `in-progress` forever and the average score is blank.
>
> **Investigation.** The feedback endpoint was reading what was in the database,
> and the database only had one answered question — so the bug had to be upstream
> of storage. I traced the runner component and found answers accumulating in a
> React state object, with exactly one `PUT` fired, on the final "Submit".
>
> **Root cause.** Client state was being treated as persistence. The API was
> designed to grade one answer per call; the UI only ever called it once.
> Downstream, `questionsAnswered` never reached `totalQuestions`, so the session
> never flipped to `completed` and the average was never computed.
>
> **Fix.** Submit each answer as the candidate advances, and recompute progress
> and the average *from the stored answers* on every submission rather than
> incrementing a counter. Two things fell out of it for free: an interrupted
> interview keeps everything answered so far, and grading latency is spread across
> the session instead of a 30-second wait at the end. I also made the runner
> resume at the first unanswered question, since the server now knows.
>
> **Prevention.** Any state a user would be upset to lose goes to the server at
> the moment it is produced, and derived fields are recomputed from the source of
> truth, never incremented and hoped about.

### Story B — "The board looked fine and did nothing"

> The Kanban board rendered columns and cards, and dragging a card animated
> correctly — but the status never changed. The handler was there and the fetch
> was correct, so I logged the drag event and saw `over: null` on every drop.
> The root cause was that the columns were never registered as drop targets:
> `@dnd-kit` needs `useDroppable` on the container and `useDraggable` on the item,
> and neither was wired — the drag was purely visual. I registered both, moved
> the drag listeners onto a dedicated grip handle so the Edit button stayed
> clickable, and added an 8 px activation distance so a tap isn't read as a drag.
> The lesson: importing a library is not using it, and any interaction that isn't
> exercised end to end should be assumed broken.

### Story C — "Anyone could create rows owned by someone else"

> Reviewing the create-application endpoint, I noticed
> `Application.create({ userId: session.user.id, ...body })`. Because the spread
> comes second, a client sending `{"userId": "<another user's id>"}` overwrites the
> server's value — rows created in someone else's account. The same pattern
> existed on the question endpoint for `contributorId`. I fixed it in two layers:
> a Zod schema per endpoint that whitelists the fields a client may send, and
> server-owned fields written *after* the spread. Then I wrote a unit test that
> feeds an injected `userId` into the schema and asserts it's stripped. The lesson
> is a rule I now apply everywhere: never spread a request body into a model.

---

## 6. Q&A — project and architecture

**Q: Why did you build this?**
> Job-hunting preparation is fragmented — one tool for mock questions, another
> for resume checks, a spreadsheet for applications, and Reddit for company
> research. I wanted one loop: research a company, practise for it, fix your
> resume against the specific posting, then track the application. It was also a
> deliberate excuse to build something with real constraints — auth, cost control,
> third-party failure — rather than another CRUD demo.

**Q: Walk me through what happens when a user starts a mock interview.**
> The setup form posts to `/api/mock-interview/create`. The handler resolves the
> session id, validates the body with Zod — bounded question count, enum'd
> level/type/difficulty — and checks the user's monthly quota *before* spending
> anything. Then it calls `generateMockInterviewQuestions`, which asks Groq for
> JSON in structured-output mode. I create the session with
> `totalQuestions = questions.length` — the count actually generated, not the count
> requested, because that's what "completed" is measured against — and insert all
> questions with one `insertMany`. If that insert fails I delete the session, so
> there's never an un-startable interview. Then I increment the quota and return
> the session id. The runner fetches the session, and critically the API projects
> `expectedKeyPoints` *out* of that response, because that's the grading rubric.

**Q: Why Next.js instead of React plus an Express API?**
> One deployable, one language, and Server Components. The dashboard reads Mongo
> directly on the server — no API hop, no client fetch, no loading spinner on
> first paint. With a split stack I'd own two deployments, CORS, and a second
> place to get auth right. The trade-off is that you must always know which side
> of the boundary a file runs on; that's the mistake people make with the App
> Router, and it's why `'use client'` in this codebase is deliberate rather than
> reflexive.

**Q: Why the separate Python service? Isn't that over-engineering?**
> Scraping is slow, fragile and has a much better ecosystem in Python —
> BeautifulSoup, and the whole anti-bot toolkit. Isolating it means the failure
> mode is contained: if it's down, company research shows curated source links and
> the rest of the app doesn't notice. I'd defend it as a boundary drawn along a
> failure domain rather than along a technology preference. That said, if the
> scraping stayed this simple, folding it into a Next.js route with `cheerio`
> would be a legitimate simplification.

**Q: What was the hardest part?**
> Getting server-side PDF parsing to work inside Next. `pdfjs-dist`'s modern
> build assumes browser globals, the legacy build needs a worker path even in
> Node, and writing that path as a string literal makes webpack try to bundle the
> `.mjs` worker and fail the build. The working combination is: legacy build,
> dynamic import, worker specifier assembled at runtime so webpack can't see it,
> and `pdfjs-dist` in `serverExternalPackages` so it stays resolvable from
> `node_modules`. The previous version of this project just disabled PDF support
> and told users to convert to DOCX — which is a workaround, not a fix.

---

## 7. Q&A — Next.js and React

**Q: Server Components vs Client Components — where's the line in your app?**
> Server by default. The dashboard home is a Server Component: it calls `auth()`,
> queries Mongo with `Promise.all`, and returns HTML — no JavaScript needed for
> that data. Anything with state or event handlers is a Client Component:
> the interview runner, the Kanban board, the forms. The rule I apply is "does
> this need interactivity or browser APIs?" — if not, it stays on the server, and
> the data never makes a round trip through an API route.

**Q: What does `dynamic = 'force-dynamic'` do and why do you use it?**
> It opts the route out of static generation and caching, so it's rendered per
> request. Every route that reads the session must have it — otherwise Next can
> try to prerender it at build time, when there is no user, and you either get a
> build error or a cached page belonging to nobody.

**Q: Why is `maxDuration = 60` on some routes?**
> Generating fifteen questions or grading a long answer exceeds the default
> serverless function timeout on the hosting platform. Sixty seconds is the
> ceiling I need; anything longer would need to become a background job with
> polling or streaming, which is on my roadmap.

**Q: How does middleware work here, and is it secure?**
> Middleware runs on the Edge runtime before the request reaches a route. Mine
> checks whether an Auth.js session cookie exists on `/dashboard/*` and redirects
> to `/login?callbackUrl=…` if not. It deliberately does *not* verify the JWT,
> because Edge can't run Mongoose and the Node-only auth config. So it is a UX
> redirect, not an authorisation boundary — the real check is `requireUserId()` in
> every handler plus owner-scoped queries. A forged cookie gets you a dashboard
> shell whose every request immediately 401s.

**Q: `params` is a Promise in your routes — why?**
> Next 15+ made dynamic route params async, so a handler does
> `const { id } = await context.params`, and a client page uses React's `use()`
> hook to unwrap it. It's part of the move toward streaming and partial
> prerendering, where route information can resolve after render begins.

**Q: You use `useCallback` in several pages. Justify it.**
> Only where a function is a dependency of `useEffect`. If the fetch function is
> redefined every render and the effect depends on it, you get an infinite loop.
> `useCallback` with an explicit dependency array — `sessionId`, or the debounced
> filters — makes the effect fire exactly when the inputs change. I don't wrap
> handlers that aren't dependencies; that would be cargo-cult memoisation.

**Q: Why debounce the question-bank filters?**
> Because typing "software engineer" fired eighteen requests, each hitting a
> `$text` search. The inputs now settle for 350 ms before the fetch dependency
> updates, so it's one request per pause. It also means the page number resets
> with the query, which avoids landing on page 3 of a new result set.

---

## 8. Q&A — database and MongoDB

**Q: Why MongoDB and not PostgreSQL?**
> The domain is document-shaped: an interview session contains questions that
> contain an evaluation object with variable-length arrays of strengths, gaps and
> missed points. In Postgres that's several tables and a join per screen, or a
> `jsonb` column that gives up the relational advantages anyway. Mongo also let
> me embed quota and reputation on the user, which are read on nearly every
> authenticated request. I'd switch to Postgres the moment I needed real
> transactions across entities or heavy analytical queries — for example if
> reputation became a financial-style ledger.

**Q: Why did you split interview sessions and questions into two collections?**
> Three reasons. The session document is written on every answer, so keeping
> twenty question documents inside it means rewriting all of them each time.
> The rubric lives on the question and must be selectively projected out during
> the interview, which is much cleaner as its own document. And a twenty-question
> session with full evaluations grows toward Mongo's 16 MB document limit faster
> than I'd want. Embedding is right when the child is small, read with the parent,
> and never written independently — none of which holds here.

**Q: Explain your connection handling.**
> Mongoose connection cached on `globalThis`, and — importantly — the connect
> *promise* is cached too, so concurrent requests during a cold start share one
> handshake instead of opening N pools. `bufferCommands: false` so queries fail
> fast instead of queueing invisibly when the database is unreachable. And the
> missing-env check is inside the function, not at module scope, because
> `next build` imports every route module while collecting page data — a
> module-scope throw breaks the build on any machine without the env var.

**Q: How does the stats endpoint work, and what did it replace?**
> It's a single `$facet` aggregation that computes counts by status, counts by
> priority, a total, and the five most recent applications in one round trip. It
> replaced code that loaded every application into Node and ran seven
> `Array.filter` passes over it. Same output, but the counting happens on the
> database, the payload is small, and it doesn't degrade as a user's history grows.

**Q: Which indexes did you create, and why each?**
> `userId` on applications and interview sessions — every query is scoped by owner.
> `sessionId` on interview questions — that's how the runner and grader fetch them.
> A compound text index on `questionText`, `companyName`, `jobRole` — that's what
> `$text` search uses. A unique compound index on `(companyName, queryKey)` in the
> research cache — that's the cache key, and unique makes the upsert safe. And a
> TTL index on `scrapedAt` so MongoDB expires research after seven days itself.

**Q: Explain the TTL index choice.**
> Expiry becomes a property of the data rather than logic I have to remember to
> write. The read path is just `findOne({ companyName, queryKey })` — no date
> filter, no cleanup job, and no chance of some new code path serving stale
> results because it forgot the `$gte`. The trade-off is that Mongo's TTL monitor
> runs about once a minute, so expiry is eventual, not exact — which is fine for a
> seven-day cache.

**Q: Why denormalise vote counts?**
> Reading a list of twenty questions shouldn't mean loading every vote record.
> The `votes` array stays the source of truth — it's what enforces one vote per
> user and lets me show your own vote — and `upvotes`/`downvotes` are recomputed
> from that array on every vote, so they can't drift. It's the classic
> read-optimisation trade: writes do a little more work, reads do far less.

**Q: What's the `pre('save')` hook doing?**
> On the application schema, when `status` is modified it appends
> `{ status, changedAt }` to `statusHistory`. That's why status changes go through
> `save()` and not `findOneAndUpdate()` — Mongoose document middleware doesn't run
> on query-level updates. It's a good example of choosing an ORM feature and then
> having to respect its rules consistently.

---

## 9. Q&A — authentication and security

**Q: Walk me through your auth.**
> Auth.js v5 with three providers: Credentials, Google and GitHub. Sessions are
> JWTs, not database sessions, for two reasons — the Credentials provider can't
> create database sessions, and a stateless token means no extra query per
> request. On sign-in the `jwt` callback puts the Mongo `_id` on the token, and
> the `session` callback copies it to `session.user.id`; I augment the Session
> type in `types/next-auth.d.ts` so handlers read it without casting. OAuth
> accounts are persisted by the Mongo adapter. Route handlers call `requireUserId()`,
> which throws a 401 that my error wrapper turns into a clean response.

**Q: JWT vs database sessions — defend your choice.**
> JWT gives me stateless verification and no session lookup on every request,
> which suits a serverless deployment. The cost is revocation: I can't invalidate
> a specific session server-side before it expires, so I keep the max age at 30
> days and would move to database sessions — or a token version claim checked
> against the user document — if I added "sign out everywhere" or admin bans.

**Q: How do you stop one user reading another's data?**
> Ownership is part of the query, not a check afterwards:
> `Application.findOne({ _id: id, userId })`. Someone else's record simply isn't
> found, which also means the response can't distinguish "doesn't exist" from
> "not yours" — no information leak. Combined with `requireObjectId`, a malformed
> or foreign id gets a 400 or a 404, never a 500 or a data leak.

**Q: What attacks did you specifically design against?**
> Mass assignment — Zod whitelists, and server-owned fields are written after the
> spread. Account enumeration — the credentials `authorize` returns `null`
> identically for unknown email and wrong password. ReDoS and regex crashes —
> user input in search filters goes through `escapeRegex`, which also fixes the
> ordinary case of someone searching for "c++". Cost-exhaustion — per-user quotas
> in front of every LLM call. Information leakage — the grading rubric is
> projected out during an interview, other users' votes are never sent, and
> anonymous contributors are stripped from populated results. And error leakage —
> unexpected exceptions are logged server-side and returned as a generic 500.

**Q: Why bcrypt cost 12?**
> It's roughly 250 ms per hash on typical hardware. That's imperceptible on a
> login but makes offline brute-forcing a stolen dump expensive, and the factor
> is tunable upward as hardware improves. I'd consider Argon2id for a new build;
> bcrypt is the pragmatic, well-supported choice in the Node ecosystem.

**Q: What's *not* secure in this app?**
> I'd list it honestly: no email verification, so an address can be claimed
> without proving ownership; no per-IP throttle on registration, so quotas can be
> sidestepped by making accounts; no password reset flow; uploads aren't scanned;
> and resume text is stored in plaintext, which for real users would deserve
> field-level encryption and a retention policy. None of those are hard — they're
> scope decisions I made deliberately, and I know the order I'd fix them in.

---

## 10. Q&A — AI integration

**Q: How do you handle the fact that LLM output is unreliable?**
> Four layers. First, structured output: I request `response_format:
> json_object`, so the provider constrains decoding to valid JSON instead of me
> hunting for braces with a regex. Second, parse defensively — the regex fallback
> is still there for fenced output. Third, sanitise: scores are clamped to their
> range, arrays are filtered to non-empty strings and length-capped, missing
> fields get defaults. A hallucinated `"score": 47` becomes 10, and a `null` in a
> strengths array is dropped before it ever reaches the database. Fourth, decide
> per feature what failure means — which is the more interesting part.

**Q: What do you mean by "decide per feature what failure means"?**
> Question generation *throws*, because an interview full of "Sample question 1"
> is worse than an error and a retry button. Tag generation *swallows* its error
> and falls back to a default tag, because failing a user's contribution over a
> nice-to-have is absurd. Answer grading fails *soft*: the route saves the answer,
> returns an `evaluationError` flag, and the report shows the answer next to the
> expected key points with a "not graded" note. Losing someone's four-hundred-word
> answer because a model hiccuped would be the worst outcome in the product.

**Q: How do you control cost?**
> Quotas before the work, not after — five resume analyses a day, ten mock
> interviews a month, enforced with an atomic `$inc` so concurrent requests can't
> both slip through. Inputs are truncated before they're sent, `max_tokens` is set
> per call, and the model is the small fast one because grading ten answers means
> ten sequential calls. On the research side, results are cached for seven days
> keyed by company and question, so a popular query costs one database read.

**Q: How would you improve grading quality?**
> Today it's a single call per answer with a rubric in the prompt, which is
> directionally useful but not calibrated — the same answer can score 6 or 7 on
> different runs. The improvements in order: lower temperature and a fixed
> few-shot rubric with anchored examples for each score band; a self-consistency
> pass that grades twice and averages when the scores disagree; and eventually a
> small labelled set of human-scored answers to measure agreement, because
> "improving" a grader you can't measure is guesswork.

**Q: Why Groq rather than OpenAI?**
> Latency and price for this workload. A ten-question interview is ten sequential
> grading calls; sub-second inference is the difference between usable and
> abandoned. It's also isolated: every prompt and parse lives in `lib/groq.ts`
> behind typed functions, so moving to another provider — or adding a fallback
> model on failure — touches one file and no route.

---

## 11. Q&A — performance, scale and cost

**Q: What would break first at 10,000 users?**
> The AI provider's rate limit and my per-request cost, before the database.
> Mongo would be fine — every hot query is indexed and owner-scoped. The fixes in
> order: move grading to a queue with streaming or polling instead of holding a
> serverless function open; add shared rate limiting in Redis instead of per-user
> counters on the document; and cache the read-heavy question bank, which is the
> only genuinely public, shared data in the app.

**Q: What have you optimised already?**
> Cached connections and connect promises; `.lean()` on read-only queries;
> `$facet` aggregation instead of counting in Node; `insertMany` instead of N
> saves; indexes on every owner-scoped and search path; pagination on the question
> bank; debounced filters; truncated prompts; and a TTL-backed research cache.

**Q: Anything you deliberately did *not* optimise?**
> The Kanban board refetches after a drop rather than updating optimistically.
> That's two requests where one would do, but it guarantees the UI never shows a
> state the server rejected. For a tracker where a wrong status is worse than a
> 200 ms delay, I'd make that trade again — and it's easy to reverse with an
> optimistic update plus rollback if the feel became a complaint.

**Q: How would you add caching?**
> The question bank is the obvious candidate: public, read-heavy, changes slowly.
> I'd start with Next's own `revalidate` on the list route, and move to Redis if I
> needed shared invalidation across instances — invalidating on contribution and
> on vote. I would not cache anything user-scoped without a per-user key, which is
> exactly the kind of mistake that leaks one user's data to another.

---

## 12. Q&A — testing and quality

**Q: How is this tested?**
> Fourteen unit tests on Node's built-in test runner, with no database or network
> — so they run in about a second. They cover the logic where bugs actually lived:
> the quota date maths that made rollovers fire at the wrong time, `escapeRegex`,
> every Zod schema including an explicit "an injected `userId` is stripped" case,
> the body parser's error mapping, and real PDF and DOCX extraction against
> fixtures.

**Q: That's not much coverage.**
> Correct, and I'd rather be precise about it than claim otherwise. What's missing
> is integration coverage of the route handlers and Mongoose queries, which needs
> a real database — `mongodb-memory-server` is the tool, and that's the next thing
> I'd add — plus one Playwright pass over the full interview flow, because that's
> the flow where the worst bug in this project lived and an end-to-end test would
> have caught it immediately. I chose to fix the bugs and write tests around the
> pure logic first because that gave the most confidence per hour; I'm not
> pretending it's a finished test strategy.

**Q: How do you know the app works end to end?**
> Beyond the unit tests, I verified the deployed behaviour directly: the
> production build compiles with no TypeScript or ESLint errors, `/dashboard`
> redirects to `/login` with a `callbackUrl`, protected APIs return 401 without a
> session, invalid bodies return 400 with field-level messages, a malformed id
> returns 400 rather than a 500, and with the database unreachable the API returns
> a clean 500 JSON instead of crashing the server.

---

## 13. Q&A — behavioural, with STAR answers

**Q: Tell me about a bug you're proud of finding.**
Use **Story A** (§5). It's the strongest because the symptom was visible, the
cause was conceptual (client state ≠ persistence), and the fix improved
resilience as a side effect.

**Q: Tell me about a time you had to make a technical trade-off.**
> **Situation.** The Kanban board needed to feel responsive, but a status change
> can be rejected — a validation failure, or a row that no longer exists.
> **Task.** Choose between optimistic updates and refetching.
> **Action.** I chose refetching and documented why: this is a tracker whose whole
> value is that it reflects reality, so a card that snaps back after appearing to
> move is worse than a short delay. I kept the change cheap to reverse — the
> refetch is a single callback, so switching to optimistic-with-rollback is
> localised.
> **Result.** The board is always consistent with the database, and I can state
> the exact condition under which I'd revisit it: if drag latency became a user
> complaint.

**Q: Tell me about something you'd do differently.**
> I'd write the test for the interview flow first. The answer-submission bug
> existed because I built the runner as a form — collect everything, submit once —
> when the domain is really a sequence of independent, individually-graded events.
> A single end-to-end test asserting "after answering two questions, the database
> holds two graded answers" would have caught it on day one. More generally I'd
> design the persistence boundary before the component, not after.

**Q: What did you learn?**
> Three things stick. Dead code is a lie the codebase tells — a quota module that
> was never called, a middleware that returned `next()` for everything, buttons
> with no handlers. Second, degradation is a feature you design, not an accident
> you discover. Third, deleting things is real work: I removed a duplicated copy
> of four pages, a typo'd config file, fourteen unused dependencies and two
> deployment-scratchpad markdown files, and the project became easier to explain,
> which is its own kind of value.

**Q: How did you decide what to build first?**
> The mock interview, because it's the feature with the most product risk — if
> AI-generated questions and grading weren't good enough to be useful, nothing
> else mattered. The tracker and question bank are conventional CRUD; I could be
> confident about those. Build the risky thing first while you still have the
> budget to change direction.

---

## 14. Whiteboard scenarios: "how would you extend it?"

Expect one of these. Answer with data model → API → UI → failure mode.

**"Add a feature where a user can share their feedback report publicly."**
> Add `visibility: 'private' | 'link'` and a random `shareToken` to the session.
> A new public route `GET /api/share/[token]` looks up by token only, returns the
> report *without* the answers unless the owner opted in, and rate-limits by IP.
> The UI is a toggle plus a copy-link button. Failure mode to name: tokens must be
> unguessable and revocable, so I'd store a nullable token and let the user rotate
> it — and I would not reuse the session id as the token.

**"Support 100 concurrent interviews."**
> Grading is the bottleneck: each is an LLM call held open in a serverless
> function. I'd move it to a queue — submit returns 202 immediately, a worker
> grades, the client subscribes via SSE or polls the question's state. That
> decouples user-perceived latency from provider latency, survives provider
> timeouts with retries, and lets me add a concurrency cap so I don't exceed the
> API rate limit. The database side barely changes.

**"Recommend questions based on a user's weak areas."**
> The grading output already contains `missedKeyPoints` and per-question
> categories. Aggregate those per user into a weakness profile — a `$group` over
> their interview questions by category and average score. For matching, embed the
> question bank into a vector index (Atlas Vector Search keeps it in the same
> database) and retrieve questions similar to their weakest categories. Start with
> the simple version — category and difficulty filters over the existing bank —
> and measure whether it helps before adding embeddings.

**"Make the app work offline."**
> Most of it can't and shouldn't — the value is server-side AI. But the tracker is
> a legitimate offline candidate: a service worker caching the list, writes queued
> in IndexedDB, and a sync on reconnect with last-write-wins per field. I'd be
> explicit that conflict resolution is the hard part, not the caching.

---

## 15. Traps and how to escape them

| Trap | The wrong answer | The right answer |
| --- | --- | --- |
| "Did you use AI to write this?" | Deny it | "I used AI assistance, the same way I'd use documentation — and I can explain every line, including the parts I rewrote because the first version was wrong. Ask me about any file." |
| "This is just CRUD." | Get defensive | "The CRUD parts are the easy 60%. The interesting parts are cost control, treating model output as untrusted input, and designing what happens when a dependency is down — happy to go deep on any of those." |
| "Why not use X instead?" | "I didn't know about X" | "I chose Y because [reason]. X would be better if [condition] — that's not true here, but it's exactly what would make me switch." |
| A question you can't answer | Bluff | "I don't know. My guess is [reasoning], and I'd verify it by [method]." Interviewers score honesty higher than guessing — bluffing that gets caught costs the interview. |
| "What's wrong with your code?" | "Nothing" | Name three real things: no integration tests, no email verification, uncalibrated grading. Then give your fix order. |
| "Is your middleware secure?" | "Yes, it protects the dashboard" | "It's a redirect, not an authorisation boundary — Edge can't run my auth stack. The real check is in every handler with owner-scoped queries." This *earns* points; claiming otherwise loses them. |
| Deep-dive into one file | Vague summary | Pick `lib/groq.ts` or the answer route and narrate line by line — you have the detail in `LEARNING.md`. |

---

## 16. Questions to ask them

Ask two or three; they signal how you think.

* "How do you handle third-party API failures in your product — retries, queues,
  or degradation? I made those choices per feature here and I'm curious how you
  draw the line."
* "What does your testing pyramid actually look like day to day, versus what's on
  the wiki?"
* "Where does the AI-feature cost control sit in your stack — infra, product, or
  each team?"
* "If I joined, what would the first thing I ship look like?"
* "What's a technical decision the team made early that you'd revisit now?"

---

## 17. Your prep plan

**One week out**
* Read `LEARNING.md` end to end, twice. Sketch the architecture diagram from
  memory until it's automatic.
* Run the app locally and click through every flow — register, interview,
  feedback, resume upload, board drag, question vote, research.
* Read these files line by line and be able to narrate each:
  `lib/groq.ts`, `lib/quota.ts`, `lib/http.ts`,
  `app/api/mock-interview/[sessionId]/answer/route.ts`,
  `app/dashboard/mock-interview/[sessionId]/page.tsx`,
  `components/applications/KanbanBoard.tsx`, `middleware.ts`.

**Three days out**
* Rehearse the 60-second pitch and the three bug stories out loud, timed.
* Answer every question in §6–§12 aloud, without reading. Note the three you
  fumble and re-read those sections.
* Deliberately break something locally (drop an index, remove the `GROQ_API_KEY`)
  and watch how the app degrades — so your answers come from observation.

**The day before**
* Re-read §4 (must-know facts) and §15 (traps).
* Prepare your demo: seeded account, one completed interview with feedback, five
  applications on the board, three questions in the bank. A demo that needs
  "imagine there's data here" undersells the work.
* Have the repo open in an editor, plus `LEARNING.md` in a second tab.

**In the interview**
* Lead with the problem, not the stack.
* Every "what" gets a "because".
* Volunteer one limitation before they find it — it makes everything else you say
  more credible.
* If asked to go deeper, go deeper. This project has the depth; your job is to
  show that you know it does.
