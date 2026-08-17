// lib/groq.ts
import Groq from 'groq-sdk';

/**
 * All LLM access goes through this module. Route handlers never talk to the SDK
 * directly, which keeps prompts, model choice, JSON handling and failure
 * behaviour in one reviewable place.
 */

/**
 * The Groq constructor throws when GROQ_API_KEY is missing, so the client is
 * built lazily. Constructing it at module scope would crash `next build`, which
 * imports every route module while collecting page data — before env vars matter.
 */
let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    groqClient = new Groq({ apiKey });
  }

  return groqClient;
}

/** Overridable so the model can be swapped without a code change. */
const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

export interface GeneratedQuestion {
  questionNumber: number;
  question: string;
  category: string;
  difficulty: string;
  expectedKeyPoints: string[];
}

export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  missedKeyPoints: string[];
  overallFeedback: string;
  exampleAnswer: string;
}

export interface ResumeAnalysis {
  matchScore: number;
  atsScore: number;
  missingKeywords: string[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

/**
 * Calls the model in JSON mode and parses the result.
 *
 * `response_format: json_object` makes the provider constrain decoding to valid
 * JSON, which removes the "find the braces with a regex" guesswork the first
 * version relied on. The regex fallback is still here for the rare case a model
 * wraps its output in a markdown fence.
 */
async function completeJSON<T>(params: {
  system: string;
  user: string;
  temperature: number;
  maxTokens: number;
}): Promise<T> {
  const completion = await getGroq().chat.completions.create({
    messages: [
      { role: 'system', content: params.system },
      { role: 'user', content: params.user },
    ],
    model: MODEL,
    temperature: params.temperature,
    max_tokens: params.maxTokens,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? '';

  if (!content) throw new Error('Model returned an empty response');

  try {
    return JSON.parse(content) as T;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model response was not valid JSON');
    return JSON.parse(match[0]) as T;
  }
}

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) ? Math.min(max, Math.max(min, num)) : fallback;
};

/** Model output is untrusted input: every array is filtered down to real strings. */
const stringList = (value: unknown, limit = 20): string[] =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string' && item.trim() !== '')
        .slice(0, limit)
    : [];

export async function optimizeResume(
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysis> {
  // Long resumes/JDs are truncated so a single request cannot blow the context window.
  const prompt = `Analyse this resume against the job description.

Resume:
${resumeText.slice(0, 12000)}

Job Description:
${jobDescription.slice(0, 8000)}

Respond with JSON shaped exactly like:
{
  "matchScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "missingKeywords": [<important keywords absent from the resume>],
  "suggestions": [<specific, actionable improvements>],
  "strengths": [<what the resume does well for this role>],
  "weaknesses": [<what weakens this application>]
}`;

  const analysis = await completeJSON<Record<string, unknown>>({
    system:
      'You are an expert resume reviewer and ATS optimisation specialist. Be specific and actionable. Always return valid JSON.',
    user: prompt,
    temperature: 0.3,
    maxTokens: 2000,
  });

  return {
    matchScore: clamp(analysis.matchScore, 0, 100, 50),
    atsScore: clamp(analysis.atsScore, 0, 100, 50),
    missingKeywords: stringList(analysis.missingKeywords),
    suggestions: stringList(analysis.suggestions),
    strengths: stringList(analysis.strengths),
    weaknesses: stringList(analysis.weaknesses),
  };
}

export async function generateMockInterviewQuestions(params: {
  companyName: string;
  jobRole: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: string;
  numQuestions: number;
  jobDescription?: string;
}): Promise<GeneratedQuestion[]> {
  const { companyName, jobRole, experienceLevel, interviewType, difficulty, numQuestions } = params;

  const prompt = `Generate ${numQuestions} ${interviewType} interview questions for a ${jobRole} position at ${companyName}.
Experience level: ${experienceLevel}
Difficulty: ${difficulty}
${params.jobDescription ? `\nJob description:\n${params.jobDescription.slice(0, 6000)}` : ''}

Respond with JSON shaped exactly like:
{ "questions": [ { "question": "...", "category": "Technical | Behavioral | System Design", "difficulty": "Easy | Medium | Hard", "expectedKeyPoints": ["...", "..."] } ] }

Every question must be answerable in prose (no live coding). Return exactly ${numQuestions} questions.`;

  const result = await completeJSON<{ questions?: unknown }>({
    system:
      'You are an expert technical interviewer. Generate realistic, role-specific questions. Return only valid JSON.',
    user: prompt,
    temperature: 0.7,
    maxTokens: 4000,
  });

  const raw = Array.isArray(result.questions) ? result.questions : [];

  const questions = raw
    .map((item, index): GeneratedQuestion | null => {
      const q = item as Record<string, unknown>;
      const text = typeof q.question === 'string' ? q.question.trim() : '';

      if (!text) return null;

      return {
        questionNumber: index + 1,
        question: text,
        category: typeof q.category === 'string' ? q.category : interviewType,
        difficulty: typeof q.difficulty === 'string' ? q.difficulty : difficulty,
        expectedKeyPoints: stringList(q.expectedKeyPoints, 8),
      };
    })
    .filter((question): question is GeneratedQuestion => question !== null)
    .slice(0, numQuestions)
    // Renumber after filtering so numbers stay contiguous (1..n) — the answer
    // endpoint looks questions up by number.
    .map((question, index) => ({ ...question, questionNumber: index + 1 }));

  // No silent placeholder questions: the caller turns this into a 502 so the user
  // can retry instead of sitting through an interview of "Sample question 1".
  if (questions.length === 0) {
    throw new Error('Question generation failed');
  }

  return questions;
}

export async function evaluateInterviewAnswer(params: {
  question: string;
  answer: string;
  expectedKeyPoints: string[];
  category: string;
  difficulty: string;
}): Promise<AnswerEvaluation> {
  const prompt = `Evaluate this interview answer.

Question: ${params.question}
Category: ${params.category}
Difficulty: ${params.difficulty}
Expected key points: ${params.expectedKeyPoints.join(', ') || 'not specified'}

Candidate answer:
${params.answer.slice(0, 8000)}

Respond with JSON shaped exactly like:
{
  "score": <integer 1-10>,
  "strengths": [<2-3 items>],
  "improvements": [<2-3 items>],
  "missedKeyPoints": [<expected points the answer did not cover>],
  "overallFeedback": "<2-3 sentences>",
  "exampleAnswer": "<a brief model answer>"
}`;

  const evaluation = await completeJSON<Record<string, unknown>>({
    system:
      'You are an experienced interviewer giving constructive, honest feedback. Score strictly. Return valid JSON.',
    user: prompt,
    temperature: 0.3,
    maxTokens: 2000,
  });

  return {
    score: Math.round(clamp(evaluation.score, 1, 10, 5)),
    strengths: stringList(evaluation.strengths, 5),
    improvements: stringList(evaluation.improvements, 5),
    missedKeyPoints: stringList(evaluation.missedKeyPoints, 8),
    overallFeedback:
      typeof evaluation.overallFeedback === 'string'
        ? evaluation.overallFeedback
        : 'No summary was returned for this answer.',
    exampleAnswer:
      typeof evaluation.exampleAnswer === 'string'
        ? evaluation.exampleAnswer
        : 'A strong answer would address each expected key point with a concrete example.',
  };
}

/**
 * Tag generation is a convenience, not a requirement: a failure here must not
 * block a contribution, so this is the one helper that swallows its error.
 */
export async function generateQuestionTags(questionText: string): Promise<string[]> {
  try {
    const result = await completeJSON<{ tags?: unknown }>({
      system: 'You generate concise technical tags. Return only valid JSON.',
      user: `Generate 3-5 lowercase, hyphenated tags for this interview question: "${questionText.slice(0, 1000)}"
Respond with JSON shaped exactly like: { "tags": ["arrays", "dynamic-programming"] }`,
      temperature: 0.5,
      maxTokens: 200,
    });

    const tags = stringList(result.tags, 5).map((tag) => tag.toLowerCase().replace(/\s+/g, '-'));

    return tags.length > 0 ? tags : ['interview'];
  } catch (error) {
    console.error('[groq] tag generation failed:', error);
    return ['interview'];
  }
}
