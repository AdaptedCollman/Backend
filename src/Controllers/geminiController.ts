import { Request, Response } from 'express';
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const handleGeminiChat = async (req: Request, res: Response) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
     res.status(400).json({ error: 'Messages array is required.' });
     return
  }

  if (!GEMINI_API_KEY) {
     res.status(500).json({ error: 'Gemini API key not configured.' });
     return
  }

  try {
    const geminiRes = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: messages.map((msg: { role: string; content: string }) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const geminiText =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't understand that.";
    res.json({ text: geminiText });
  } catch (error: any) {
    res.status(500).json({
      error:
        error?.response?.data?.error?.message ||
        'Failed to connect to Gemini API.',
    });
  }
};
