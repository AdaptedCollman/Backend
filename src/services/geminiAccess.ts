import axios from "axios";
import { QuestionInput } from "../Models/QuestionModel";

export const generateQuestionFromGemini = async (
  topic: string,
  difficulty: number
): Promise<QuestionInput> => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("Missing Gemini API Key");

    const prompt = getPrompt(topic, difficulty);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Gemini API returned empty content");

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini response is not in expected JSON format");

    const parsed = JSON.parse(jsonMatch[0]);

    const answerOptions = parsed.answerOptions;
    const correctIndex = parseInt(parsed.correctAnswer, 10) - 1;
    const correctOption = answerOptions?.[correctIndex];

    if (!correctOption) throw new Error("correctAnswer index not found in answerOptions");

    const questionData: QuestionInput = {
      content: parsed.content,
      topic: topic as "math" | "english" | "hebrew",
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

const getPrompt = (topic: string, difficulty: number): string => {
  const commonJsonFormat = `
Return ONLY valid JSON with the following fields:
{
  "content": "Question text",
  "topic": "${topic}",
  "difficulty": ${difficulty},
  "correctAnswer": "A number between 1 and 4, as a string",
  "answerOptions": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "explanation": "Short explanation for the correct answer"
}

No markdown, no extra text.
  `;

  if (topic === "hebrew") {
    const type = Math.floor(Math.random() * 2) + 1;
    return type === 1
      ? `צור שאלה מסוג אנלוגיה לפסיכומטרי בעברית. ${commonJsonFormat}`
      : `צור שאלה מסוג הבנה והסקה לפסיכומטרי בעברית. כתוב קטע קצר ושאלה שמבקשת להסיק או לשלול טענה. ${commonJsonFormat}`;
  }

  if (topic === "english") {
    const type = Math.floor(Math.random() * 2) + 1;
    return type === 1
      ? `Generate an English Sentence Completion question for the Israeli psychometric exam. ${commonJsonFormat}`
      : `Generate an English Restatement question for the Israeli psychometric exam: Choose the sentence that best keeps the original meaning. ${commonJsonFormat}`;
  }

  if (topic === "math") {
    const type = Math.floor(Math.random() * 4) + 1;
    const intro = `צור שאלה אחת מסוג הבנה כמותית לפסיכומטרי, בעברית.\n\n`; // משותף לכולן
    const base = `
📌 כללים:
- הניסוח חייב להיות בעברית מדוברת וברורה.
- אין להשתמש באלגברה סימבולית כבדה, משוואות מסובכות, או גיאומטריה פורמלית.
- נסח עם יחידות רלוונטיות (ש"ח, שעות, קמ"ש) אם זה רלוונטי.
- אם אתה בוחר לשאול על גרף או פונקציה – כל המידע הדרוש חייב להיות כתוב במפורש (אין גרף ויזואלי).

החזר רק JSON תקני בפורמט הבא:
{
  "content": "נוסח השאלה",
  "topic": "math",
  "difficulty": ${difficulty},
  "correctAnswer": "1" | "2" | "3" | "4",
  "answerOptions": ["תשובה 1", "תשובה 2", "תשובה 3", "תשובה 4"],
  "explanation": "הסבר קצר לתשובה הנכונה"
}

📌 החזר אך ורק JSON. אין להחזיר טקסט נוסף, markdown, או הסברים חיצוניים.
`;
    switch (type) {
      case 1:
        return `${intro}- שאלת מהירות/זמן/מרחק או רווח/ממוצע.\n${base}`;
      case 2:
        return `${intro}- השוואת ביטויים מתמטיים פשוטים כמו: z > x² + y².\n${base}`;
      case 3:
        return `${intro}- חקירה של פונקציות עם ערך מוחלט. דוגמה: |x+1| - |x-1|.\n${base}`;
      case 4:
        return `${intro}- שאלות על נקודות/קואורדינטות (ללא שרטוט), לדוגמה: מעגל עם רדיוס.\n${base}`;
      default:
        return `${intro}${base}`;
    }
  }

  throw new Error("Unsupported topic");
};