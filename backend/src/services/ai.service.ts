import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { CreateAssignmentDTO, IGeneratedPaper, ISection, IQuestion } from '../types';


function buildPrompt(formData: CreateAssignmentDTO): string {
  const {
    subject,
    grade,
    totalMarks,
    numberOfQuestions,
    questionTypes,
    duration,
    difficultyDistribution,
    additionalInstructions,
    uploadedFileContent,
  } = formData;

  const difficulty = difficultyDistribution || { easy: 30, medium: 40, hard: 30 };

  const easyCount = Math.round((difficulty.easy / 100) * numberOfQuestions);
  const hardCount = Math.round((difficulty.hard / 100) * numberOfQuestions);
  const mediumCount = numberOfQuestions - easyCount - hardCount;

  let prompt = `You are an expert academic question paper creator. Generate a complete question paper with the following specifications:

**Subject:** ${subject}
**Grade/Level:** ${grade}
**Total Marks:** ${totalMarks}
**Total Number of Questions:** EXACTLY ${numberOfQuestions} questions
**Duration:** ${duration || '3 hours'}
**Question Types to include:** ${questionTypes.join(', ')}

**Difficulty Distribution:**
- Easy: ${easyCount} questions (${difficulty.easy}%)
- Medium: ${mediumCount} questions (${difficulty.medium}%)
- Hard: ${hardCount} questions (${difficulty.hard}%)

**Instructions for generating the paper:**
1. Organize questions into logical sections based on question types.
2. Each section should have a clear title (e.g., "Section A", "Section B"), a description of the question type, and instructions.
3. Distribute marks appropriately across questions to total exactly ${totalMarks} marks.
4. For MCQ questions, provide exactly 4 options labeled (a), (b), (c), (d) and specify the correct answer.
5. For True/False questions, specify the correct answer.
6. For Short Answer and Long Answer questions, provide a brief expected answer or key points.
7. Ensure questions are appropriate for the ${grade} level in ${subject}.
8. Number all questions sequentially across sections.
`;

  if (additionalInstructions) {
    prompt += `\n**Additional Instructions from the teacher:** ${additionalInstructions}\n`;
  }

  if (uploadedFileContent) {
    prompt += `\n**IMPORTANT: Base the questions on the following content/syllabus provided by the teacher:**\n\`\`\`\n${uploadedFileContent.substring(0, 15000)}\n\`\`\`\n`;
  }

  prompt += `
**CRITICAL: You MUST respond with ONLY a valid JSON object. No explanations, no markdown, no code fences. ONLY the JSON object.**

The JSON must match this exact schema:
{
  "title": "string - The title of the question paper",
  "subject": "${subject}",
  "grade": "${grade}",
  "duration": "${duration || '3 hours'}",
  "totalMarks": ${totalMarks},
  "instructions": ["array of general instructions for students, at least 5 instructions"],
  "sections": [
    {
      "id": "string",
      "title": "Section A",
      "description": "Description of the section type",
      "instructions": "Specific instructions for this section",
      "totalMarks": number,
      "questions": [
        {
          "id": "string",
          "questionNumber": 1,
          "text": "The question text",
          "type": "MCQ" | "Short Answer" | "Long Answer" | "True/False",
          "options": ["(a) option1", "(b) option2", "(c) option3", "(d) option4"],
          "correctAnswer": "The correct answer",
          "difficulty": "Easy" | "Medium" | "Hard",
          "marks": number
        }
      ]
    }
  ]
}

Remember:
- The "options" field is ONLY for MCQ type questions. Omit it for other types.
- Total of all question marks must equal ${totalMarks}.
- Total number of questions must be EXACTLY ${numberOfQuestions}.
- Respond with ONLY the JSON object, nothing else.`;

  return prompt;
}

function assignUUIDs(paper: IGeneratedPaper): IGeneratedPaper {
  return {
    ...paper,
    sections: paper.sections.map((section: ISection) => ({
      ...section,
      id: uuidv4(),
      questions: section.questions.map((question: IQuestion) => ({
        ...question,
        id: uuidv4(),
      })),
    })),
  };
}

function validatePaperStructure(paper: unknown): paper is IGeneratedPaper {
  if (!paper || typeof paper !== 'object') return false;

  const p = paper as Record<string, unknown>;

  if (typeof p.title !== 'string') return false;
  if (typeof p.subject !== 'string') return false;
  if (typeof p.grade !== 'string') return false;
  if (typeof p.duration !== 'string') return false;
  if (typeof p.totalMarks !== 'number') return false;
  if (!Array.isArray(p.instructions)) return false;
  if (!Array.isArray(p.sections)) return false;

  for (const section of p.sections as Record<string, unknown>[]) {
    if (typeof section.title !== 'string') return false;
    if (!Array.isArray(section.questions)) return false;

    for (const question of section.questions as Record<string, unknown>[]) {
      if (typeof question.text !== 'string') return false;
      if (typeof question.questionNumber !== 'number') return false;
      if (!['MCQ', 'Short Answer', 'Long Answer', 'True/False'].includes(question.type as string)) return false;
      if (typeof question.difficulty !== 'string') return false;
      if (typeof question.marks !== 'number') return false;
    }
  }

  return true;
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  // Strip markdown code fences
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

export async function generateQuestionPaper(formData: CreateAssignmentDTO): Promise<IGeneratedPaper> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = buildPrompt(formData);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  const cleanedJson = cleanJsonResponse(text);

  let parsedPaper: unknown;
  try {
    parsedPaper = JSON.parse(cleanedJson);
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', cleanedJson.substring(0, 500));
    throw new Error(`Failed to parse AI response as JSON: ${(parseError as Error).message}`);
  }

  if (!validatePaperStructure(parsedPaper)) {
    throw new Error('AI response does not match expected question paper structure');
  }

  const paperWithUUIDs = assignUUIDs(parsedPaper);

  return paperWithUUIDs;
}
