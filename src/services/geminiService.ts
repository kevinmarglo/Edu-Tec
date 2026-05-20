import { GoogleGenAI, Type } from "@google/genai";
import { SubjectId, Question, StudyPlan, UserPerformance } from "../types";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY || 'AIzaSyDiWitLY1kEwOPe1it8Lqs8zqIfDkNrZsk';
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
       throw new Error("GEMINI_API_KEY is missing. In AI Studio, please ensure your API key is associated with a project in the Secrets/Settings tab. For external deployments (Vercel/Netlify), add GEMINI_API_KEY to your environment variables.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const model = "gemini-3-flash-preview";

export async function generatePracticeQuestions(subjectId: string, count: number = 5): Promise<Question[]> {
  const prompt = `Generate ${count} multiple-choice questions for the G.C.E. Ordinary Level (O/L) examination in Sri Lanka for the subject: ${subjectId}. 
  Provide questions, options, and explanations in both English and Sinhala.
  The output must be a structured JSON array.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              subjectId: { type: Type.STRING },
              question: { type: Type.STRING },
              questionSi: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              optionsSi: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              correctAnswer: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
              explanation: { type: Type.STRING },
              explanationSi: { type: Type.STRING },
            },
            required: ["id", "subjectId", "question", "questionSi", "options", "optionsSi", "correctAnswer", "explanation", "explanationSi"],
          },
        },
      },
    });

    if (!response.text) throw new Error("Empty response from AI");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

export async function getTutorResponse(message: string, subjectId?: SubjectId, history: any[] = []) {
  const systemInstruction = `You are LankaEducate, an expert AI tutor for Sri Lankan G.C.E. O/L students. 
  Your goal is to help students understand concepts in ${subjectId || 'all O/L subjects'}.
  You support both English and Sinhala languages.
  Be encouraging, provide clear explanations, and use examples relevant to the Sri Lankan curriculum.
  If asked a question in Sinhala, respond in Sinhala or a mix of both if appropriate.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model,
      contents: history.length > 0 ? [...history, { role: 'user', parts: [{ text: message }] }] : message,
      config: {
        systemInstruction,
      },
    });

    if (!response.text) throw new Error("Empty response from AI");
    return response.text;
  } catch (error) {
    console.error("Error getting tutor response:", error);
    throw error;
  }
}

export async function generatePersonalizedStudyPlan(performances: UserPerformance[]): Promise<StudyPlan[]> {
  const performanceStr = performances.map(p => `${p.subjectId}: ${p.score}/${p.totalQuestions}`).join(', ');
  const prompt = `Based on the following G.C.E. O/L student performance: ${performanceStr}.
  Generate a personalized study plan for each subject where performance exists.
  Identify weak areas and suggest specific topics to focus on.
  Provide recommendations in both English and Sinhala.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              subjectId: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              recommendationSi: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
            },
            required: ["subjectId", "recommendation", "recommendationSi", "priority"],
          },
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw error;
  }
}
