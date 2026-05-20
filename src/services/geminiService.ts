import { GoogleGenAI, Type } from "@google/genai";
import { SubjectId, Question, StudyPlan, UserPerformance } from "../types";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    let apiKey = '';

    // Portably check import.meta.env first (Vite standard for client-side)
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
      }
    } catch (e) {
      // Ignore
    }

    // Safely fallback to Node/Server-side process.env if available (safeguarded against browser ReferenceErrors)
    if (!apiKey) {
      try {
        if (typeof process !== 'undefined' && process.env) {
          apiKey = (process.env as any).GEMINI_API_KEY || '';
        }
      } catch (e) {
        // Ignore ReferenceError in browser
      }
    }

    // Direct fallback key as requested to ensure it always works
    if (!apiKey) {
      apiKey = 'AIzaSyCHruzTd6sY_j0_qrjN3YwNH1iN5tM8jg4';
    }

    if (!apiKey || apiKey === "undefined" || apiKey === "") {
       throw new Error("GEMINI_API_KEY is missing. In AI Studio, please ensure your API key is associated with a project in the Secrets/Settings tab. For external deployments (Vercel/Netlify), add VITE_GEMINI_API_KEY to your environment variables.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function nativeGeminiRequest(params: {
  model: string;
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
}) {
  let apiKey = '';

  // Get the key
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
    }
  } catch (e) {}

  if (!apiKey) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        apiKey = (process.env as any).GEMINI_API_KEY || '';
      }
    } catch (e) {}
  }

  if (!apiKey) {
    apiKey = 'AIzaSyCHruzTd6sY_j0_qrjN3YwNH1iN5tM8jg4';
  }

  apiKey = apiKey.trim();

  // Normalize contents to API format
  let contentsArray: any[] = [];
  if (typeof params.contents === 'string') {
    contentsArray = [{ role: 'user', parts: [{ text: params.contents }] }];
  } else if (Array.isArray(params.contents)) {
    contentsArray = params.contents.map(c => {
      if (typeof c === 'string') {
        return { role: 'user', parts: [{ text: c }] };
      }
      return c;
    });
  } else if (params.contents && typeof params.contents === 'object') {
    contentsArray = [params.contents];
  }

  // Double check that we map parts correctly
  const payload: any = {
    contents: contentsArray,
  };

  if (params.systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: params.systemInstruction }]
    };
  }

  const generationConfig: any = {};
  if (params.responseMimeType) {
    generationConfig.responseMimeType = params.responseMimeType;
  }
  if (params.responseSchema) {
    generationConfig.responseSchema = params.responseSchema;
  }

  if (Object.keys(generationConfig).length > 0) {
    payload.generationConfig = generationConfig;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const rawMessage = errorData?.error?.message || response.statusText;
    throw new Error(rawMessage || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty or invalid candidate response from Gemini API");
  }
  return text;
}

const model = "gemini-2.5-flash";

export async function generatePracticeQuestions(subjectId: string, count: number = 5): Promise<Question[]> {
  const prompt = `Generate ${count} multiple-choice questions for the G.C.E. Ordinary Level (O/L) examination in Sri Lanka for the subject: ${subjectId}. 
  Provide questions, options, and explanations in both English and Sinhala.
  The output must be a structured JSON array.`;

  try {
    const text = await nativeGeminiRequest({
      model,
      contents: prompt,
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
        }
      }
    });

    return JSON.parse(text);
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
    const contents = history.length > 0 
      ? [...history, { role: 'user', parts: [{ text: message }] }] 
      : message;

    const text = await nativeGeminiRequest({
      model,
      contents,
      systemInstruction,
    });

    return text;
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
    const text = await nativeGeminiRequest({
      model,
      contents: prompt,
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
      }
    });

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw error;
  }
}
