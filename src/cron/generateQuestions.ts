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
  return `Generate 10 new questions similar to these examples. Each question should follow the same structure and format. Provide the following questions in a precise JSON format.

Rules for questions:
1. Content must be clear and educational
2. Topic must be exactly one of: 'math', 'english', 'hebrew'
3. Difficulty must be a number between 1 and 5
4. Must have exactly 4 answer options
5. Correct answer must be included in answer options
6. All fields are required except explanation
7. Dont add id to the questions
8. All Math and Hebrew questions should be in Hebrew

Example questions:
${JSON.stringify(sampleQuestions, null, 2)}

Return the questions in valid JSON array format that exactly matches the IQuestion interface structure.`;
};
