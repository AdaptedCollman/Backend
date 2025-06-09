import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question } from '../Models/QuestionModel';
import dotenv from 'dotenv';

dotenv.config();

export const generateQuestions = async (): Promise<void> => {
  try {
    console.log('Starting question generation process...');

    // Fetch sample questions
    const sampleQuestions = await Question.find().limit(10);
    if (!sampleQuestions.length) {
      throw new Error('No sample questions found');
    }

    // Prepare prompt for Gemini
    const prompt = createPromptForQuestions(sampleQuestions);
    console.log('Prompt:', prompt);

    // Create instance of Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate content from model
    const result = await model.generateContent(prompt);
    const response = result.response;

    // Clean the response by removing the ```json wrapper
    const messageContent = await response.text();
    const jsonStart = messageContent.indexOf('[');
    const jsonEnd = messageContent.lastIndexOf(']');
    const jsonString = messageContent.slice(jsonStart, jsonEnd + 1);

    console.log('Response from API:', jsonString);

    if (!jsonString) {
      throw new Error('No valid message content from API');
    }

    // Parse and validate the response
    const generatedQuestions = JSON.parse(jsonString);

    // Validate each question
    const validQuestions = generatedQuestions.filter((q: any) => {
      return (
        q.content &&
        ['math', 'english', 'hebrew'].includes(q.topic) &&
        typeof q.difficulty === 'number' &&
        q.difficulty >= 1 &&
        q.difficulty <= 5 &&
        q.correctAnswer &&
        Array.isArray(q.answerOptions) &&
        q.answerOptions.length === 4 &&
        q.answerOptions.includes(q.correctAnswer)
      );
    });

    if (validQuestions.length === 0) {
      throw new Error('No valid questions were generated');
    }

    // Save to database
    await Question.insertMany(validQuestions);

    console.log(`Successfully generated and saved ${validQuestions.length} new questions`);
  } catch (error) {
    console.error('Error in question generation:', error);
    throw error;
  }
};

const createPromptForQuestions = (sampleQuestions: any[]): string => {
  return `You are an expert psychometric exam question writer.

Your task is to generate 10 new multiple-choice questions that resemble official psychometric exam questions.

====================
🧠 GENERAL FORMAT:
====================
Return a **valid JSON array**, where each item matches the following format:

{
  "content": string,              // the question text
  "topic": "math" | "english" | "hebrew",
  "difficulty": number (1–5),
  "answerOptions": string[4],     // list of 4 possible answers
  "correctAnswer": string,        // must be one of the 4 options
  "explanation"?: string
}

====================
📌 TOPIC RULES:
====================

1. **ENGLISH**:
   - Include both:
     - Sentence Completions (choose the best word to complete a sentence)
     - Restatements (choose the best paraphrase of a sentence)

2. **HEBREW**:
   - Include both:
     - אנלוגיות (analogies — e.g. עצירות : נגמר)
     - הבנה והסקה (short text with logical inference questions)

3. **MATH** (all questions must be fully in Hebrew):
   - Write general quantitative reasoning questions, like the ones in the real psychometric exam.
   - Examples include: proportions, equations, averages, time/speed/distance, logic, graphs.
   - Avoid questions that look like school algebra or geometry exercises.
   - Use only real-world style problems (like train speeds, prices, ratio, etc.)
   - Examples from past tests include:
     - כמה מהמספרים W, X, Y, Z חיוביים בהכרח?
     - גדיון נסע מנקודה A לעיר F בכבישים המסומנים במפה...
     - תן קרוא 20 עמודים בשעה, ברמן קרא 5 עמודים...
   - Use easy difficulty for the first 3 questions, medium for the next 4, and hard for the last 3.

====================
🚫 DO NOT:
====================
- Do NOT include any question "id"
- Do NOT return explanations unless it's included in the structure
- Do NOT wrap the output in markdown
- Do NOT return anything outside of the JSON array

====================
✅ START FROM THIS:
====================
Here are some sample questions for reference:
${JSON.stringify(sampleQuestions, null, 2)}

Now generate 10 new questions following all the above rules, and return only valid JSON.
`;
};
