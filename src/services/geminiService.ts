import { SubjectId, Question, StudyPlan, UserPerformance } from "../types";

/**
 * Client-side Gemini API service proxies.
 * All requests are routed to our secure server-side Express API,
 * keeping keys protected and avoiding CORS exceptions in browser sandboxes.
 */

export async function generatePracticeQuestions(subjectId: string, count: number = 5): Promise<Question[]> {
  try {
    const res = await fetch("/api/gemini/generate-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ subjectId, count })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error || `Server responded with status ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error generating practice questions on client:", error);
    throw error;
  }
}

export async function getTutorResponse(message: string, subjectId?: SubjectId, history: any[] = []): Promise<string> {
  try {
    const res = await fetch("/api/gemini/tutor-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message, subjectId, history })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    return data.text;
  } catch (error: any) {
    console.error("Error getting tutor response on client:", error);
    throw error;
  }
}

export async function generatePersonalizedStudyPlan(performances: UserPerformance[]): Promise<StudyPlan[]> {
  try {
    const res = await fetch("/api/gemini/study-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ performances })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error || `Server responded with status ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error generating personalized study plan on client:", error);
    throw error;
  }
}
