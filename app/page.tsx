// app/page.tsx
import Link from 'next/link';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

import Navigation, { BrandMark } from '@/components/Navigation';
import MagneticLink from '@/components/landing/MagneticLink';
import {
  Counter,
  FloatLayer,
  Marquee,
  Parallax,
  Reveal,
  ScrollProgress,
  Stagger,
  StaggerItem,
  WordReveal,
} from '@/components/landing/motion-primitives';
import {
  BentoTile,
  FaqAccordion,
  MockCard,
  QuoteCard,
  StatTile,
  StepCard,
} from '@/components/landing/cards';

/* ================================================================== */
/* Content                                                             */
/* ================================================================== */

const HIRED_AT = [
  'Accenture',
  'Capgemini',
  'ServiceNow',
  'Deloitte',
  'Infosys',
  'Cognizant',
  'TCS',
  'Wipro',
  'Zoho',
];

const STATS = [
  { value: 12400, suffix: '+', label: 'Questions in the bank', accent: 'text-crimson' },
  { value: 48000, suffix: '+', label: 'Mock rounds scored', accent: 'text-azure' },
  { value: 92, suffix: '%', label: 'Report feeling ready', accent: 'text-gold-deep' },
  { value: 7, suffix: ' days', label: 'Company data freshness', accent: 'text-ink' },
];

const REASONS = [
  {
    n: '01',
    title: 'Save hours on research',
    body: 'Company intel gathered, deduped and summarised for you — no more forum archaeology the night before.',
    accent: 'text-crimson',
    tint: 'tint-crimson',
    span: 'lg:col-span-3',
  },
  {
    n: '02',
    title: 'Beat the ATS',
    body: 'Match score and the exact keyword gaps between your resume and the posting.',
    accent: 'text-azure',
    tint: '',
    span: 'lg:col-span-3',
  },
  {
    n: '03',
    title: 'Practice out loud',
    body: 'AI mock interviews, scored on structure, depth and delivery.',
    accent: 'text-gold-deep',
    tint: 'tint-gold',
    span: 'lg:col-span-2',
  },
  {
    n: '04',
    title: 'Stay organised',
    body: 'Every application and round on one board.',
    accent: 'text-crimson',
    tint: '',
    span: 'lg:col-span-2',
  },
  {
    n: '05',
    title: 'Learn from others',
    body: 'Real questions, really asked, upvoted by candidates.',
    accent: 'text-azure',
    tint: 'tint-azure',
    span: 'lg:col-span-2',
  },
];

const TESTIMONIALS_A = [
  {
    quote: 'The company dossier had the exact three-round format I got. Nothing surprised me.',
    name: 'Priya Sharma',
    role: 'Software Engineer · Accenture',
    initials: 'PS',
    accentBorder: 'border-crimson',
    accentBg: 'bg-crimson/10',
  },
  {
    quote: "Resume scoring found gaps I'd missed for months. Two weeks later, three callbacks.",
    name: 'Daniel Kim',
    role: 'Product Manager · Capgemini',
    initials: 'DK',
    accentBorder: 'border-azure',
    accentBg: 'bg-azure/15',
  },
  {
    quote: 'The question bank is unreal — every question my interviewer asked was in there.',
    name: 'Aisha Rahman',
    role: 'Data Analyst · ServiceNow',
    initials: 'AR',
    accentBorder: 'border-gold-deep',
    accentBg: 'bg-gold/25',
  },
  {
    quote: "The tracker's reminders meant I never walked into a round unprepared.",
    name: 'Marco Torres',
    role: 'UX Designer · Deloitte',
    initials: 'MT',
    accentBorder: 'border-ink',
    accentBg: 'bg-muted',
  },
];

const TESTIMONIALS_B = [
  {
    quote: "Feedback on delivery, not just content — that's what actually moved the needle.",
    name: 'Lena Wu',
    role: 'Software Engineer · Infosys',
    initials: 'LW',
    accentBorder: 'border-crimson',
    accentBg: 'bg-crimson/10',
  },
  {
    quote: 'Went from dreading interviews to looking forward to them. Worth every minute.',
    name: 'Sam Osei',
    role: 'Product Manager · Cognizant',
    initials: 'SO',
    accentBorder: 'border-azure',
    accentBg: 'bg-azure/15',
  },
  {
    quote: 'I stopped guessing what to study. The dossier told me exactly where to aim.',
    name: 'Rohit Nair',
    role: 'Backend Engineer · Zoho',
    initials: 'RN',
    accentBorder: 'border-gold-deep',
    accentBg: 'bg-gold/25',
  },
  {
    quote: 'Four rounds tracked, two offers, zero spreadsheets. That is the whole pitch.',
    name: 'Fatima Noor',
    role: 'Data Scientist · TCS',
    initials: 'FN',
    accentBorder: 'border-ink',
    accentBg: 'bg-muted',
  },
];

const STACK = [
  { label: 'Frontend', accent: 'text-crimson', items: ['Next.js 16', 'TypeScript', 'TailwindCSS', 'shadcn/ui'] },
  { label: 'Backend', accent: 'text-azure', items: ['Node.js', 'API Routes', 'NextAuth v5', 'MongoDB + Mongoose'] },
  { label: 'AI & parsing', accent: 'text-gold-deep', items: ['Groq API', 'pdf-parse', 'mammoth'] },
  { label: 'Deployment', accent: 'text-ink', items: ['Vercel', 'MongoDB Atlas'] },
];

const FAQS = [
  {
    q: 'Is Prep AI free to start?',
    a: 'Yes. Create an account and run your first mock interviews and resume scans at no cost — no card required. Paid tiers only raise the daily and monthly limits.',
  },
  {
    q: 'Where does company data come from?',
    a: 'Public candidate reports on Reddit, LinkedIn and Twitter, aggregated into one dossier and cached for seven days so repeat lookups are instant. Every claim links back to its source.',
  },
  {
    q: 'What resume formats are supported?',
    a: 'PDF and DOCX. We parse the file, score it 0–100 against the specific job description, flag ATS-compatibility issues and list the keywords you are missing.',
  },
  {
    q: 'How are mock interviews scored?',
    a: 'Each answer is evaluated on structure, technical depth and delivery, then returned with concrete strengths, gaps and a model answer. Full history is kept so you can watch the trend.',
  },
  {
    q: 'Is my data private?',
    a: 'Your resumes and interview answers are encrypted at rest and never shared, sold, or used to train public models. You can delete everything from your profile at any time.',
  },
];

/* ================================================================== */
/* Small building blocks                                               */
/* ================================================================== */

function Eyebrow({ children, className = 'text-crimson' }: { children: React.ReactNode; className?: string }) {
  return <div className={`eyebrow-hand text-[26px] sm:text-[30px] ${className}`}>{children}</div>;
}

function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`font-display text-[34px] font-normal leading-[1.04] sm:text-[44px] lg:text-[54px] ${className}`}>
      {children}
    </h2>
  );
}

function Lede({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[16px] font-medium leading-[1.65] text-ink-muted sm:text-[17px] ${className}`}>
      {children}
    </p>
  );
}

function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full border-[1.5px] border-ink px-3 py-1.5 text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}

function FeatureTag({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`kicker inline-block rounded-full px-3 py-1.5 ${className}`}>{children}</span>;
}

/** One row of the platform showcase: copy on one side, mock card on the other. */
function FeatureRow({
  tag,
  tagClass,
  title,
  body,
  bullets,
  flip = false,
  children,
}: {
  tag: string;
  tagClass: string;
  title: string;
  body: string;
  bullets?: string[];
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal from={flip ? 'left' : 'right'} className={flip ? 'lg:order-2' : ''}>
        <FeatureTag className={tagClass}>{tag}</FeatureTag>
        <h3 className="my-4 font-display text-[30px] font-normal leading-[1.06] sm:text-[36px] lg:text-[42px]">
          {title}
        </h3>
        <Lede>{body}</Lede>
        {bullets && (
          <ul className="mt-6 space-y-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-[14.5px] font-semibold">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border-[1.5px] border-ink">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      <Reveal from={flip ? 'right' : 'left'} delay={0.1} className={flip ? 'lg:order-1' : ''}>
        {children}
      </Reveal>
    </div>
  );
}

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <ScrollProgress />

      <main id="top" className="w-full overflow-x-clip bg-white text-ink">
        <Navigation />

        {/* ============================================================ */}
        {/* Hero                                                          */}
        {/* ============================================================ */}
        <section className="relative gutter pb-24 pt-16 sm:pt-20 lg:pb-32 lg:pt-24">
          {/* Torn colour bands, drifting slightly against the scroll */}
          <FloatLayer
            distance={-70}
            className="torn-band pointer-events-none absolute left-[-10%] top-[110px] hidden h-[240px] w-[120%] bg-crimson opacity-[0.92] sm:block"
          />
          <FloatLayer
            distance={50}
            className="torn-band-alt pointer-events-none absolute left-[-6%] top-[430px] hidden h-[200px] w-[112%] bg-azure opacity-90 lg:block"
          />
          <FloatLayer
            distance={-30}
            className="torn-chip pointer-events-none absolute right-[2%] top-[300px] hidden h-[150px] w-[190px] bg-gold opacity-90 lg:block"
          />

          {/* Drifting crosshairs and dots */}
          <span
            aria-hidden="true"
            className="plus-mark animate-floaty pointer-events-none absolute left-[5%] top-[120px] hidden h-8 w-8 text-crimson sm:block"
          />
          <span
            aria-hidden="true"
            className="plus-mark animate-floaty pointer-events-none absolute right-[6%] top-[180px] hidden h-7 w-7 text-azure lg:block"
            style={{ animationDelay: '1.6s' }}
          />
          <span
            aria-hidden="true"
            className="dot-grid pointer-events-none absolute bottom-[80px] left-[3%] hidden h-[60px] w-[110px] text-ink opacity-30 lg:block"
          />

          <div className="relative z-10 mx-auto flex max-w-[860px] flex-col items-center text-center">
        

            <WordReveal
              text="Prepare, practice and"
              delay={0.15}
              className="mt-7 text-[44px] font-medium leading-[1.04] tracking-[-0.035em] text-[#1D1002] sm:text-[62px] lg:text-[86px]"
            >
              <span className="whitespace-nowrap">land the offer.</span>
            </WordReveal>

            <Reveal delay={0.35} className="mt-8 max-w-[600px]">
              <Lede className="text-[17px] font-semibold text-[#141212] sm:text-[19px]">
                The focused workspace for interview prep — company dossiers, resume
                scoring, AI mock rounds and a living question bank, with feedback
                built into every step.
              </Lede>
            </Reveal>

            <Reveal delay={0.45} className="mt-9 flex flex-col items-center gap-3.5 sm:flex-row">
              <MagneticLink
                href="/register"
                className="group inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-ink px-8 py-4 text-base font-bold text-white hover:shadow-[0_18px_40px_-12px_rgba(20,18,14,0.6)]"
              >
                Start free
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </MagneticLink>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-xl border-[1.5px] border-ink bg-white/75 px-8 py-4 text-base font-bold text-ink backdrop-blur-sm transition-colors hover:bg-white"
              >
                Sign in
              </Link>
            </Reveal>

            <Reveal delay={0.55} className="mt-6">
              <p className="text-[13px] font-semibold text-ink-soft">
                Free to start · No card required · Your data stays yours
              </p>
            </Reveal>
          </div>

          {/* Hero preview collage */}
          <Parallax distance={26} className="relative z-10 mt-16 lg:mt-20">
            <Reveal delay={0.2}>
              <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-end gap-5 md:grid-cols-3">
                <div className="md:mb-8">
                  <MockCard label="match score" accent="azure" meta="RESUME">
                    <div className="flex items-end gap-3">
                      <span className="font-display text-[58px] leading-none text-azure">87</span>
                      <span className="kicker pb-2.5 text-ink-muted">of 100</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        { l: 'ATS compatibility', v: 92, c: 'bg-azure' },
                        { l: 'Keyword coverage', v: 74, c: 'bg-gold' },
                      ].map((r) => (
                        <div key={r.l}>
                          <div className="mb-1.5 flex justify-between text-[11.5px] font-bold">
                            <span>{r.l}</span>
                            <span>{r.v}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full border border-ink/20 bg-muted">
                            <div className={`h-full ${r.c}`} style={{ width: `${r.v}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </MockCard>
                </div>

                <MockCard label="live round" accent="crimson" meta="3 OF 8">
                  <div className="kicker mb-3 flex items-center gap-2 text-ink-muted">
                    <span className="animate-recblink h-2 w-2 rounded-full bg-crimson" />
                    recording
                  </div>
                  <p className="font-display text-[21px] leading-[1.3]">
                    &ldquo;Walk me through a system you designed end to end.&rdquo;
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t-[1.5px] border-dashed border-ink pt-4">
                    <Pill className="bg-gold">Clarity 92</Pill>
                    <Pill className="bg-crimson text-white">Depth 78</Pill>
                  </div>
                </MockCard>

                <div className="md:mb-8">
                  <MockCard label="pipeline" accent="gold" meta="12 ACTIVE">
                    <div className="space-y-2.5">
                      {[
                        { c: 'ServiceNow', s: 'Offer', cls: 'bg-gold' },
                        { c: 'Accenture', s: 'Round 2', cls: 'bg-azure text-white' },
                        { c: 'Deloitte', s: 'Applied', cls: 'bg-white' },
                      ].map((row) => (
                        <div
                          key={row.c}
                          className="flex items-center justify-between rounded-lg border-[1.5px] border-ink bg-white px-3 py-2.5"
                        >
                          <span className="text-[13px] font-bold">{row.c}</span>
                          <span
                            className={`rounded-full border-[1.5px] border-ink px-2.5 py-0.5 text-[10.5px] font-bold ${row.cls}`}
                          >
                            {row.s}
                          </span>
                        </div>
                      ))}
                    </div>
                  </MockCard>
                </div>
              </div>
            </Reveal>
          </Parallax>
        </section>

        {/* ============================================================ */}
        {/* Logo marquee                                                  */}
        {/* ============================================================ */}
        <section className="relative z-10 border-y-[1.5px] border-ink bg-paper py-10">
          <div className="kicker gutter mb-6 text-center text-ink-muted">
            Trusted by candidates hired at
          </div>
          <Marquee speed={38}>
            {HIRED_AT.map((company) => (
              <span
                key={company}
                className="whitespace-nowrap text-[22px] font-extrabold tracking-[-0.01em] text-ink opacity-70 transition-opacity duration-300 hover:opacity-100 sm:text-[26px]"
              >
                {company}
              </span>
            ))}
          </Marquee>
        </section>

        {/* ============================================================ */}
        {/* Stats                                                         */}
        {/* ============================================================ */}
        <section className="relative z-10 gutter border-b-[1.5px] border-ink py-12">
          <Stagger className="grid grid-cols-2 divide-ink/15 lg:grid-cols-4 lg:divide-x">
            {STATS.map((s) => (
              <StaggerItem key={s.label}>
                <StatTile
                  accent={s.accent}
                  label={s.label}
                  value={<Counter to={s.value} suffix={s.suffix} />}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ============================================================ */}
        {/* Why — bento grid                                              */}
        {/* ============================================================ */}
        <section id="why" className="relative z-10 gutter border-b-[1.5px] border-ink py-20 lg:py-28">
          <Reveal className="mb-12 max-w-[760px]">
            <Eyebrow>why prep ai?</Eyebrow>
            <SectionTitle className="mt-2">
              Five ways it moves your job hunt forward
            </SectionTitle>
          </Reveal>

          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {REASONS.map((r) => (
              <StaggerItem key={r.n} className={r.span}>
                <BentoTile
                  index={r.n}
                  title={r.title}
                  body={r.body}
                  accent={r.accent}
                  tint={r.tint}
                  className="h-full"
                />
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ============================================================ */}
        {/* Platform showcase                                             */}
        {/* ============================================================ */}
        <section id="features" className="relative z-10 gutter py-20 lg:py-28">
          <Reveal className="mx-auto mb-16 max-w-[680px] text-center lg:mb-24">
            <Eyebrow className="text-azure">the platform</Eyebrow>
            <SectionTitle className="mt-2">Five tools, one interview workflow</SectionTitle>
          </Reveal>

          <div className="space-y-20 lg:space-y-28">
            <FeatureRow
              tag="Company intelligence"
              tagClass="bg-crimson text-white"
              title="Know the company before you walk in"
              body="Candidate reports from Reddit, LinkedIn and Twitter, aggregated into one dossier — the process round by round, salary insights and real reviews."
              bullets={['Round-by-round breakdown', 'Median offer and review counts', 'Cached 7 days, loads instantly']}
            >
              <MockCard label="dossier — Accenture" accent="crimson" meta="CACHED 2d">
                <div className="space-y-3">
                  {['Online assessment · 90 min', 'Technical round · DSA + project', 'HR round · behavioural'].map(
                    (step, i) => (
                      <div key={step} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border-[1.5px] border-ink text-[11px] font-bold">
                          {i + 1}
                        </span>
                        <span className="text-[13.5px] font-semibold">{step}</span>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-5 flex gap-4 border-t-[1.5px] border-dashed border-ink pt-4">
                  <div className="flex-1">
                    <div className="kicker text-ink-muted">Median offer</div>
                    <div className="font-display text-[30px] leading-tight">₹12.4 LPA</div>
                  </div>
                  <div className="flex-1">
                    <div className="kicker text-ink-muted">Reviews</div>
                    <div className="font-display text-[30px] leading-tight">318</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill>Reddit</Pill>
                  <Pill>LinkedIn</Pill>
                  <Pill className="bg-gold">7-day cache</Pill>
                </div>
              </MockCard>
            </FeatureRow>

            <FeatureRow
              flip
              tag="Resume optimizer"
              tagClass="bg-azure text-white"
              title="Fix the resume before a recruiter sees it"
              body="Upload a PDF or DOCX and get a 0–100 match score against the job description, full ATS analysis, missing keywords and specific rewrites worth making."
              bullets={['PDF and DOCX parsing', 'ATS compatibility report', 'Keyword gaps with suggested rewrites']}
            >
              <MockCard label="resume scan" accent="azure" meta="SDE-2">
                <div className="rounded-xl border-[1.5px] border-ink bg-azure p-5 text-white">
                  <div className="flex items-end gap-4">
                    <span className="font-display text-[62px] leading-[0.9]">
                      87<span className="text-[28px]">%</span>
                    </span>
                    <span className="kicker pb-3">match score</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { l: 'ATS compatibility', v: 92, c: 'bg-white' },
                      { l: 'Keyword coverage', v: 74, c: 'bg-gold' },
                    ].map((r) => (
                      <div key={r.l}>
                        <div className="mb-1.5 flex justify-between text-[11.5px] font-bold">
                          <span>{r.l}</span>
                          <span>{r.v}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/30">
                          <div className={`h-full ${r.c}`} style={{ width: `${r.v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="kicker mb-2.5 text-ink-muted">Missing keywords</div>
                  <div className="flex flex-wrap gap-2">
                    {['CI/CD', 'Kubernetes', 'system design'].map((k) => (
                      <Pill key={k} className="bg-crimson/10">
                        {k}
                      </Pill>
                    ))}
                  </div>
                </div>
              </MockCard>
            </FeatureRow>

            <FeatureRow
              tag="Mock interviews"
              tagClass="bg-ink text-white"
              title="Rehearse the real thing, then read the tape"
              body="Company and role-specific questions asked in real time, scored by AI on structure, depth and delivery — with strengths, gaps and a full history."
              bullets={['Role and company specific', 'Scored on three axes', 'History so you can see the trend']}
            >
              <MockCard label="live round" accent="ink" meta="Q3 OF 8">
                <div className="kicker mb-4 flex items-center gap-2.5 text-ink-muted">
                  <span className="animate-recblink h-2.5 w-2.5 rounded-full bg-crimson" />
                  recording · 02:14
                </div>
                <p className="font-display text-[24px] leading-[1.28]">
                  &ldquo;Walk me through a system you designed end to end.&rdquo;
                </p>
                <div className="mt-5 flex flex-wrap gap-2 border-t-[1.5px] border-dashed border-ink pt-4">
                  <Pill className="bg-gold">Clarity 92</Pill>
                  <Pill className="bg-crimson text-white">Depth 78</Pill>
                  <Pill>Delivery 85</Pill>
                </div>
                <p className="mt-4 text-[13.5px] font-medium leading-[1.6] text-ink-muted">
                  Strong framing. Add the trade-offs you rejected and why — that&rsquo;s what
                  the panel probes next.
                </p>
              </MockCard>
            </FeatureRow>

            <FeatureRow
              flip
              tag="Application tracker"
              tagClass="bg-gold text-ink"
              title="Every application, every round, one board"
              body="Kanban, table and calendar views of the whole pipeline, with round-by-round tracking, reminders before each interview, analytics and CSV or PDF export."
              bullets={['Kanban, table and calendar', 'Reminders before every round', 'CSV and PDF export']}
            >
              <MockCard label="pipeline" accent="gold" meta="12 ACTIVE" bodyClassName="bg-peach">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="kicker mb-2">Applied</div>
                    <div className="mb-2 rounded-lg border-[1.5px] border-ink bg-white p-2.5 text-[11.5px] font-semibold">
                      Infosys · SDE
                    </div>
                    <div className="rounded-lg border-[1.5px] border-ink bg-white p-2.5 text-[11.5px] font-semibold">
                      Zoho · Backend
                    </div>
                  </div>
                  <div>
                    <div className="kicker mb-2">Interview</div>
                    <div className="mb-2 rounded-lg border-[1.5px] border-ink bg-azure p-2.5 text-[11.5px] font-semibold text-white">
                      Accenture · R2
                    </div>
                    <div className="rounded-lg border-[1.5px] border-ink bg-white p-2.5 text-[11.5px] font-semibold">
                      Deloitte · R1
                    </div>
                  </div>
                  <div>
                    <div className="kicker mb-2">Offer</div>
                    <div className="rounded-lg border-[1.5px] border-ink bg-gold p-2.5 text-[11.5px] font-semibold">
                      ServiceNow ✓
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t-[1.5px] border-dashed border-ink pt-4">
                  <Pill className="bg-white">Kanban</Pill>
                  <Pill className="bg-white">Table</Pill>
                  <Pill className="bg-white">Calendar</Pill>
                </div>
              </MockCard>
            </FeatureRow>

            <FeatureRow
              tag="Question bank"
              tagClass="bg-crimson text-white"
              title="Questions that were actually asked"
              body="Candidates post what they were asked; the community upvotes what's real and answers it. Filter by role, company and difficulty — AI catches duplicates."
              bullets={['Filter by role, company, difficulty', 'Community-upvoted answers', 'AI de-duplication keeps it clean']}
            >
              <MockCard label="question bank" accent="crimson" meta="12,400+">
                <div className="divide-y-[1.5px] divide-dashed divide-ink">
                  {[
                    { v: 248, q: 'Explain event loop vs worker threads.', m: 'Accenture · SDE-1', d: 'Medium', c: 'bg-gold' },
                    { v: 191, q: 'Design a rate limiter for a public API.', m: 'ServiceNow · SDE-2', d: 'Hard', c: 'bg-crimson text-white' },
                    { v: 137, q: 'Tell me about a deadline you missed.', m: 'Capgemini · Any', d: 'Easy', c: 'bg-azure/20' },
                  ].map((row, i) => (
                    <div key={row.q} className={`flex items-start gap-4 py-4 ${i === 0 ? 'pt-0' : ''}`}>
                      <div className="flex w-8 flex-none flex-col items-center rounded-lg border-[1.5px] border-ink py-1">
                        <span className="text-[10px] leading-none">▲</span>
                        <span className="text-[12px] font-bold leading-tight">{row.v}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-bold leading-snug">{row.q}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-ink-muted">{row.m}</span>
                          <span
                            className={`rounded-full border border-ink px-2 py-0.5 text-[10px] font-bold ${row.c}`}
                          >
                            {row.d}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </MockCard>
            </FeatureRow>
          </div>
        </section>

        {/* ============================================================ */}
        {/* Process                                                       */}
        {/* ============================================================ */}
        <section id="process" className="relative z-10 gutter ruled border-y-[1.5px] border-ink py-20 lg:py-28">
          <Reveal className="mx-auto mb-16 max-w-[620px] text-center">
            <Eyebrow className="text-azure">the process</Eyebrow>
            <SectionTitle className="mt-2">Ready in three steps</SectionTitle>
          </Reveal>

          <Stagger className="mx-auto flex max-w-[1000px] flex-col gap-12 sm:flex-row sm:gap-4">
            {[
              { title: 'Add your targets', body: "Roles, seniority and the companies you're chasing.", accent: 'text-crimson' },
              { title: 'Research & rehearse', body: 'Pull the dossier, fix the resume, run mock rounds.', accent: 'text-azure' },
              { title: 'Track it to the offer', body: 'Every round on the board until you sign.', accent: 'text-gold-deep' },
            ].map((s, i, arr) => (
              <StaggerItem key={s.title} className="flex-1">
                <StepCard n={i + 1} title={s.title} body={s.body} accent={s.accent} last={i === arr.length - 1} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ============================================================ */}
        {/* Testimonials                                                  */}
        {/* ============================================================ */}
        <section id="stories" className="relative z-10 overflow-hidden py-20 lg:py-28">
          <Reveal className="gutter mb-14 text-center">
            <Eyebrow className="text-gold-deep">the receipts</Eyebrow>
            <SectionTitle className="mt-2">Loved by candidates</SectionTitle>
          </Reveal>

          <div className="space-y-5">
            <Marquee speed={58}>
              {TESTIMONIALS_A.map((t) => (
                <QuoteCard key={t.name} {...t} />
              ))}
            </Marquee>
            <Marquee speed={64} reverse>
              {TESTIMONIALS_B.map((t) => (
                <QuoteCard key={t.name} {...t} />
              ))}
            </Marquee>
          </div>
        </section>

        {/* ============================================================ */}
        {/* Stack                                                         */}
        {/* ============================================================ */}
        <section className="relative z-10 gutter border-t-[1.5px] border-ink py-20 lg:py-24">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal from="right">
              <Eyebrow className="text-gold-deep">under the hood</Eyebrow>
              <SectionTitle className="mt-2 lg:text-[46px]">
                Built on a modern, boring-in-a-good-way stack
              </SectionTitle>
            </Reveal>

            <Stagger className="flex flex-col gap-6">
              {STACK.map((group) => (
                <StaggerItem key={group.label}>
                  <div className={`kicker mb-3 ${group.accent}`}>{group.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border-[1.5px] border-ink bg-white px-4 py-2 text-[13px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--ink)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ============================================================ */}
        {/* FAQ                                                           */}
        {/* ============================================================ */}
        <section id="faq" className="relative z-10 gutter border-t-[1.5px] border-ink py-20 lg:py-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <Reveal from="right">
              <Eyebrow>questions?</Eyebrow>
              <SectionTitle className="mt-2 lg:text-[46px]">Answered</SectionTitle>
              <Lede className="mt-4">
                Still stuck? Everything is free to try — the fastest answer is usually to
                just run a scan.
              </Lede>
              <div aria-hidden="true" className="mt-8 flex flex-col gap-2.5">
                <span className="h-[5px] w-14 bg-crimson" />
                <span className="h-[5px] w-10 bg-azure" />
                <span className="h-[5px] w-16 bg-gold" />
              </div>
            </Reveal>

            <Reveal from="left" delay={0.1}>
              <FaqAccordion items={FAQS} />
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA                                                           */}
        {/* ============================================================ */}
        <section className="relative z-10 gutter overflow-hidden border-t-[1.5px] border-ink py-24 text-center lg:py-32">
          <FloatLayer
            distance={-40}
            className="torn-band-alt pointer-events-none absolute inset-x-[-6%] top-10 h-[220px] bg-azure opacity-90"
          />
          <FloatLayer
            distance={30}
            className="torn-band pointer-events-none absolute inset-x-[-6%] top-[130px] h-[190px] bg-crimson opacity-90"
          />
          <div
            aria-hidden="true"
            className="animate-gridpan pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(#141210 1px,transparent 1px),linear-gradient(90deg,#141210 1px,transparent 1px)',
              backgroundSize: '44px 44px',
              WebkitMaskImage: 'radial-gradient(circle at 50% 50%,#000,transparent 70%)',
              maskImage: 'radial-gradient(circle at 50% 50%,#000,transparent 70%)',
            }}
          />

          <div className="relative z-[2]">
            <Reveal from="down">
              <h2 className="text-[38px] font-bold leading-[1.02] tracking-[-0.04em] text-white [text-shadow:3px_3px_0_rgba(20,18,14,0.25)] sm:text-[52px] lg:text-[64px]">
                Ready to land the offer?
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-[520px] text-lg font-semibold text-white">
                Start your first mock interview in under three minutes.
              </p>
            </Reveal>
            <Reveal delay={0.2} className="mt-9">
              <MagneticLink
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-10 py-4.5 text-base font-bold text-ink shadow-[4px_4px_0_rgba(20,18,14,0.35)] hover:shadow-[0_20px_44px_-12px_rgba(20,18,14,0.6)]"
              >
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </MagneticLink>
            </Reveal>
          </div>
        </section>

        {/* ============================================================ */}
        {/* Footer                                                        */}
        {/* ============================================================ */}
        <footer className="relative z-10 gutter border-t-[1.5px] border-ink bg-paper py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 text-ink">
                <BrandMark />
                <span className="text-[19px] font-extrabold tracking-[-0.01em]">PrepAI</span>
              </Link>
              <p className="mt-4 max-w-[28ch] text-[13.5px] font-medium leading-[1.6] text-ink-muted">
                The focused workspace for interview prep.
              </p>
            </div>

            {[
              { title: 'Product', links: [['Why PrepAI', '#why'], ['Platform', '#features'], ['Process', '#process']] },
              { title: 'Resources', links: [['Stories', '#stories'], ['FAQ', '#faq']] },
              { title: 'Account', links: [['Log in', '/login'], ['Sign up', '/register']] },
            ].map((col) => (
              <div key={col.title}>
                <div className="kicker mb-4 text-ink">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-crimson"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t-[1.5px] border-dashed border-ink pt-6 text-[13px] font-medium text-ink-muted sm:flex-row">
            <span>© {new Date().getFullYear()} Prep AI. All rights reserved.</span>
            <span className="font-hand text-[17px]">built for people who hate winging it</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
