import axios from "axios";
import { QuestionInput } from "../Models/QuestionModel";

export const generateQuestionFromGemini = async (
  topic: string,
  difficulty: number
): Promise<QuestionInput> => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key");
    }

    const prompt = `
אתה מערכת ליצירת שאלות בסגנון פסיכומטרי. צור שאלה חדשה בנושא "${topic}" ברמת קושי ${difficulty} (1-5).
השאלה צריכה לכלול:
- שאלה מנוסחת היטב
- 4 תשובות אפשריות
- תשובה נכונה אחת בלבד (תציין את מספרה מ-1 עד 4)
- הסבר קצר לתשובה

החזר אך ורק JSON תקני עם השדות:
{
  "content": "נוסח השאלה",
  "topic": "${topic}",
  "difficulty": ${difficulty},
  "correctAnswer": "המספר של התשובה הנכונה, מ-1 עד 4",
  "answerOptions": ["תשובה 1", "תשובה 2", "תשובה 3", "תשובה 4"],
  "explanation": "הסבר לתשובה הנכונה"
}

עכשיו צור שאלה חדשה לפי הכללים.
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error("Gemini API response missing content:", response.data);
      throw new Error("Gemini API returned empty content");
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Gemini response is not JSON:", rawText);
      throw new Error("Gemini response is not in expected JSON format");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse JSON:", jsonMatch[0]);
      throw new Error("Invalid JSON format");
    }

    if (!parsed.answerOptions || !Array.isArray(parsed.answerOptions)) {
      console.error("Invalid or missing 'answerOptions' in response:", parsed);
      throw new Error("Gemini response missing 'answerOptions' array");
    }

    if (!parsed.content || !parsed.correctAnswer) {
      console.error("Missing content or correctAnswer in parsed object:", parsed);
      throw new Error("Missing content or correctAnswer");
    }

    const answerOptions = parsed.answerOptions;
    const correctIndex = parseInt(parsed.correctAnswer, 10) - 1;
    const correctOption = answerOptions[correctIndex];

    if (!correctOption) {
      throw new Error("correctAnswer index not found in answerOptions");
    }

    const questionData: QuestionInput = {
      content: parsed.content,
      topic: topic as 'math' | 'english' | 'hebrew',
      difficulty,
      correctAnswer: correctOption,
      answerOptions,
      explanation: parsed.explanation || "",
    };

    return questionData;

  } catch (error: any) {
    console.error("Error in generateQuestionFromGemini:", error?.message || error);
    throw new Error("Failed to generate question from Gemini");
  }
};
