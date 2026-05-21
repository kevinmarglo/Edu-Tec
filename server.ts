import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Crucial: Use standard body-parsers for API POST endpoints
  app.use(express.json({ limit: '10mb' }));

  // Helper to obtain server-side secure Gemini client
  function getGeminiClient(): GoogleGenAI {
    // Dynamically retrieve the loaded environment variables
    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || 'AIzaSyBagEUT0YKxGqnd5r-hAMtwyZdW5fyEmrw').trim();
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Robust server-side AI content generator with sequential API fallbacks (gemini-3.5-flash -> gemini-2.5-flash)
  async function generateContentWithFallback(params: {
    contents: any;
    config?: any;
  }) {
    const ai = getGeminiClient();
    const models = ["gemini-3.5-flash", "gemini-2.5-flash"];
    let lastError: any = null;

    for (const model of models) {
      try {
        console.log(`[Gemini-Server] Sending request to ${model}...`);
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        
        if (response && response.text) {
          console.log(`[Gemini-Server] Success responding via ${model}.`);
          return response.text;
        }
        throw new Error("Empty or invalid response body from Gemini model.");
      } catch (err: any) {
        console.warn(`[Gemini-Server] Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error("All Gemini models failed to process the request.");
  }

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 1. Generate practice questions
  app.post("/api/gemini/generate-questions", async (req, res) => {
    const { subjectId, count } = req.body;
    console.log(`[API] generate-questions for ${subjectId} (count: ${count})`);
    
    const prompt = `Generate ${count || 5} multiple-choice questions for the G.C.E. Ordinary Level (O/L) examination in Sri Lanka for the subject: ${subjectId}. 
    Provide questions, options, and explanations in both English and Sinhala.
    The output must be a structured JSON array conforming to the specified response schema.`;

    try {
      const text = await generateContentWithFallback({
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
            }
          }
        }
      });

      res.json(JSON.parse(text));
    } catch (err: any) {
      console.error("[API] generate-questions error:", err);
      res.status(500).json({ error: err?.message || err || "Internal Server Error" });
    }
  });

  // 2. Expert tutor response (with chat history)
  app.post("/api/gemini/tutor-response", async (req, res) => {
    const { message, subjectId, history } = req.body;
    console.log(`[API] tutor-response for ${subjectId}`);

    const systemInstruction = `You are LankaEducate, an expert AI tutor for Sri Lankan G.C.E. O/L students. 
    Your goal is to help students understand concepts in ${subjectId || 'all O/L subjects'}.
    You support both English and Sinhala languages.
    Be encouraging, provide clear explanations, and use examples relevant to the Sri Lankan curriculum.
    If asked a question in Sinhala (or Singlish), respond warmly and accurately in Sinhala or a mix of both if appropriate.`;

    let contentsArray: any[] = [];
    if (history && Array.isArray(history)) {
      contentsArray = history.map((item: any) => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: Array.isArray(item.parts) ? item.parts : [{ text: String(item.text || item) }]
      }));
    }
    contentsArray.push({ role: 'user', parts: [{ text: message }] });

    try {
      const text = await generateContentWithFallback({
        contents: contentsArray,
        config: {
          systemInstruction,
        }
      });

      res.json({ text });
    } catch (err: any) {
      console.error("[API] tutor-response error:", err);
      res.status(500).json({ error: err?.message || err || "Internal Server Error" });
    }
  });

  // 3. Personalized study plan
  app.post("/api/gemini/study-plan", async (req, res) => {
    const { performances } = req.body;
    console.log(`[API] study-plan generation`);

    const performanceStr = Array.isArray(performances) 
      ? performances.map((p: any) => `${p.subjectId}: ${p.score}/${p.totalQuestions}`).join(', ')
      : '';

    const prompt = `Based on the following G.C.E. O/L student performance history: ${performanceStr}.
    Generate a personalized study plan for each subject where performance exists.
    Identify weak areas and suggest specific topics to focus on.
    Provide recommendations in both English and Sinhala.`;

    try {
      const text = await generateContentWithFallback({
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
          }
        }
      });

      res.json(JSON.parse(text));
    } catch (err: any) {
      console.error("[API] study-plan error:", err);
      res.status(500).json({ error: err?.message || err || "Internal Server Error" });
    }
  });

  // Vite development or production asset middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind exclusively to 0.0.0.0 and port 3000 as required
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server running on http://localhost:${PORT}`);
  });
}

startServer();
