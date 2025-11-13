// lib/groq.ts
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function optimizeResume(resumeText: string, jobDescription: string) {
  const prompt = `Analyze this resume against the job description and provide optimization suggestions.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide a detailed analysis in JSON format:
{
  "matchScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "missingKeywords": [<array of important missing keywords>],
  "suggestions": [<array of specific improvement suggestions>],
  "strengths": [<array of strong points in the resume>],
  "weaknesses": [<array of areas to improve>]
}

Return ONLY valid JSON, nothing else.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume reviewer and ATS optimization specialist. Provide actionable, specific feedback. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    
    // Parse the JSON
    const analysis = JSON.parse(jsonString);

    // Ensure all fields are properly formatted
    return {
      matchScore: Math.min(100, Math.max(0, Number(analysis.matchScore) || 50)),
      atsScore: Math.min(100, Math.max(0, Number(analysis.atsScore) || 50)),
      missingKeywords: Array.isArray(analysis.missingKeywords) 
        ? analysis.missingKeywords.filter((k: any) => typeof k === 'string')
        : [],
      suggestions: Array.isArray(analysis.suggestions) 
        ? analysis.suggestions.filter((s: any) => typeof s === 'string')
        : [],
      strengths: Array.isArray(analysis.strengths) 
        ? analysis.strengths.filter((s: any) => typeof s === 'string')
        : [],
      weaknesses: Array.isArray(analysis.weaknesses) 
        ? analysis.weaknesses.filter((w: any) => typeof w === 'string')
        : [],
    };
  } catch (error) {
    console.error('Error optimizing resume:', error);
    
    // Return a safe fallback
    return {
      matchScore: 50,
      atsScore: 50,
      missingKeywords: ['Unable to analyze at this time'],
      suggestions: ['Please try again or contact support'],
      strengths: ['Resume uploaded successfully'],
      weaknesses: ['Analysis temporarily unavailable'],
    };
  }
}

export async function generateMockInterviewQuestions(params: {
  companyName: string;
  jobRole: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: string;
  numQuestions: number;
  jobDescription?: string;
}) {
  const {
    companyName,
    jobRole,
    experienceLevel,
    interviewType,
    difficulty,
    numQuestions,
    jobDescription,
  } = params;

  const prompt = `Generate ${numQuestions} ${interviewType} interview questions for a ${jobRole} position at ${companyName}.
Experience Level: ${experienceLevel}
Difficulty: ${difficulty}
${jobDescription ? `\nJob Description:\n${jobDescription}` : ''}

Format each question as a JSON object with:
- questionNumber (1 to ${numQuestions})
- question (the interview question)
- category (e.g., "Technical", "Behavioral", "System Design")
- difficulty ("Easy", "Medium", or "Hard")
- expectedKeyPoints (array of key points)

Return ONLY a valid JSON array.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer. Generate realistic questions. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    const questions = JSON.parse(jsonString);

    return questions.map((q: any, index: number) => ({
      questionNumber: q.questionNumber || index + 1,
      question: q.question || q.questionText || '',
      category: q.category || interviewType,
      difficulty: q.difficulty || difficulty,
      expectedKeyPoints: Array.isArray(q.expectedKeyPoints) ? q.expectedKeyPoints : [],
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    
    return Array.from({ length: numQuestions }, (_, i) => ({
      questionNumber: i + 1,
      question: `Sample ${interviewType} question ${i + 1} for ${jobRole} at ${companyName}`,
      category: interviewType,
      difficulty: difficulty,
      expectedKeyPoints: ['Key point 1', 'Key point 2'],
    }));
  }
}

export async function evaluateInterviewAnswer(params: {
  question: string;
  answer: string;
  expectedKeyPoints: string[];
  category: string;
  difficulty: string;
}) {
  const { question, answer, expectedKeyPoints, category, difficulty } = params;

  const prompt = `Evaluate this interview answer:

Question: ${question}
Category: ${category}
Difficulty: ${difficulty}
Expected Key Points: ${expectedKeyPoints.join(', ')}

Answer:
${answer}

Provide evaluation in JSON:
{
  "score": <1-10>,
  "strengths": [<2-3 strengths>],
  "improvements": [<2-3 improvements>],
  "missedKeyPoints": [<missed points>],
  "overallFeedback": "<2-3 sentences>",
  "exampleAnswer": "<brief example>"
}

Return ONLY valid JSON.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert interviewer providing constructive feedback. Return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    const evaluation = JSON.parse(jsonString);

    return {
      score: Math.min(10, Math.max(1, evaluation.score || 5)),
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
      improvements: Array.isArray(evaluation.improvements) ? evaluation.improvements : [],
      missedKeyPoints: Array.isArray(evaluation.missedKeyPoints) ? evaluation.missedKeyPoints : [],
      overallFeedback: evaluation.overallFeedback || 'Good effort.',
      exampleAnswer: evaluation.exampleAnswer || 'A strong answer would cover the key concepts.',
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    
    return {
      score: 5,
      strengths: ['Demonstrates understanding'],
      improvements: ['Add more examples', 'Elaborate on concepts'],
      missedKeyPoints: expectedKeyPoints.slice(0, 2),
      overallFeedback: 'Good effort. Consider expanding on key concepts.',
      exampleAnswer: 'A strong answer would address each aspect with specific examples.',
    };
  }
}

export async function generateQuestionTags(questionText: string): Promise<string[]> {
  const prompt = `Generate 3-5 relevant tags for this interview question: "${questionText}"
Return as a JSON array of strings. Example: ["arrays", "dynamic-programming", "optimization"]`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Generate relevant technical tags. Return only JSON array.' },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating tags:', error);
    return ['technical', 'interview'];
  }
}
