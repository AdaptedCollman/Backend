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
- תשובה נכונה אחת בלבד
- הסבר קצר לתשובה

החזר אך ורק JSON תקני עם השדות:
{
  "content": "נוסח השאלה",
  "topic": "${topic}",
  "difficulty": ${difficulty},
  "correctAnswer": "ה-id של התשובה הנכונה (למשל '1')",
  "answerOptions": ["תשובה 1", "תשובה 2", "תשובה 3", "תשובה 4"],
  "explanation": "הסבר לתשובה הנכונה"
}

📌 דוגמה:
{
  "question": "מהי בירת צרפת?",
  "options": [
    { "id": "1", "text": "רומא" },
    { "id": "2", "text": "פריז" },
    { "id": "3", "text": "מדריד" },
    { "id": "4", "text": "ברלין" }
  ],
  "correctAnswer": "2",
  "explanation": "פריז היא בירת צרפת."
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

const parsed = JSON.parse(jsonMatch[0]);

const answerOptions = parsed.options.map((o: any) => o.text);
const correctOption = parsed.options.find((o: any) => o.id === parsed.correctAnswer);
if (!correctOption) {
  throw new Error("correctAnswer ID not found in options");
}

const questionData: QuestionInput = {
  content: parsed.question,
  topic: topic as 'math' | 'english' | 'hebrew', // <- פתרון לבעיה שלך
  difficulty,
  correctAnswer: correctOption.text,
  answerOptions,
  explanation: parsed.explanation,
};

return questionData;


  } catch (error: any) {
    console.error("Error in generateQuestionFromGemini:", error?.message || error);
    throw new Error("Failed to generate question from Gemini");
  }
};
