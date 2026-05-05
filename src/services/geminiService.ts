import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface HealthCluster {
  name: string;
  icon: string; // emoji
  status: 'green' | 'amber' | 'red' | 'null';
  summary: string;
}

export interface MicroHabit {
  habit: string;
  metric_target: string;
  expected_outcome: string; // Detailed motivational info
}

export interface WatchListMetric {
  metric: string;
  simplified_name: string; // First sentence headline
  result: string;
  range: string;
  note: string; // Detailed explanation
}

export interface HealthInsights {
  id?: string; // For bookmarking
  timestamp?: number;
  health_score: number; // 0-100
  score_label: string; // e.g. "Great", "Good", "Needs Attention"
  clusters: HealthCluster[];
  cards: {
    doctor_questions: string[];
    micro_habits: MicroHabit[];
    watch_list: WatchListMetric[];
  };
  closing_quote: string;
}

export async function analyzeHealthReport(fileBase64: string, mimeType: string): Promise<HealthInsights> {
  const prompt = `
    You are HealthLens, a compassionate and precise health report analyst. 
    Your job is to help patients understand their reports clearly, honestly, and without causing unnecessary anxiety.

    Follow these steps in order:
    1. EXTRACT CONFIRMED METRICS: Only work with confirmed numeric results.
    2. OVERALL HEALTH SCORE: Calculate an overall health score (0-100) based on the balance of In-Range vs Out-of-Range metrics.
       - 0-30: Red
       - 31-50: Dark Orange
       - 51-70: Orange
       - 71-85: Yellow Green
       - 86-100: Green
       Provide a 'score_label' matching these ranges.
    3. BUILD ORGAN SNAPSHOT: Map confirmed metrics EXCLUSIVELY to these 6 systems: Cardiovascular, Metabolic, Liver, Kidney, Blood Health, Thyroid/Hormonal.
       - For each system, if data exists: provide a 'status' (green|amber|red) and a 'summary'.
       - If NO data exists for a system: set 'status' to 'null' and 'summary' to 'N/A'.
    4. GENERATE 3 CARDS:
       - Micro Habits: 3-5 habits. 'habit' should be a single clear instruction. 'expected_outcome' should be a detailed motivational paragraph.
       - Watch List: TOP 3 MARKERS ONLY. 'simplified_name' should be a short layman name. 'note' should be a detailed explanation of why it matters.
       - Doctor Questions: TOP 3 ONLY.
    5. CLOSING QUOTE: One warm, specific sentence.

    Return strictly JSON with this structure:
    {
      "health_score": 85,
      "score_label": "Great",
      "clusters": [
        { "name": "Cardiovascular", "icon": "❤️", "status": "green | amber | red | null", "summary": "Detailed summary or N/A" },
        { "name": "Metabolic", "icon": "🩸", "status": "...", "summary": "..." },
        { "name": "Liver", "icon": "🛡️", "status": "...", "summary": "..." },
        { "name": "Kidney", "icon": "💧", "status": "...", "summary": "..." },
        { "name": "Blood Health", "icon": "🔬", "status": "...", "summary": "..." },
        { "name": "Thyroid/Hormonal", "icon": "⚖️", "status": "...", "summary": "..." }
      ],
      "cards": {
        "micro_habits": [{ "habit": "...", "metric_target": "...", "expected_outcome": "..." }],
        "watch_list": [{ "metric": "...", "simplified_name": "...", "result": "...", "range": "...", "note": "..." }],
        "doctor_questions": ["Question 1", "Question 2", "Question 3"]
      },
      "closing_quote": "..."
    }

    Guardrails:
    - Never call a borderline result excellent.
    - Terminology in Watch List must be extremely simple.
    - EXACTLY 3 doctor questions max.
    - EXACTLY 3 health watch list markers max.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { data: fileBase64, mimeType: mimeType } }
        ],
      }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as HealthInsights;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze report. Please ensure the file is clear.");
  }
}
