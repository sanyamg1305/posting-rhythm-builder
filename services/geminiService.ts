
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, PostingStrategy } from "../types";

export const generateStrategy = async (state: AppState): Promise<PostingStrategy> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("API Key is missing. Please set VITE_GEMINI_API_KEY in your environment variables.");
    throw new Error("MISSING_API_KEY");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Generate a comprehensive B2B LinkedIn/X posting strategy for a founder.
    
    INPUTS:
    Founder Lifestyle: ${state.lifestyle}
    Target ICP: ${state.icp}
    Content Strengths: ${state.strengths.join(", ")}
    Preferred Tone: ${state.tone}

    STRICT GUIDELINES:
    - Target senior leadership audiences.
    - Avoid generic LinkedIn buzzwords (synergy, deep dive, game changer).
    - Avoid cringe hooks.
    - Do NOT include any conversational filler or "Here is what I think".
    - Output MUST be structured precisely according to the schema.
    - All times MUST be provided in both IST and GMT (e.g., "10:00 AM IST / 04:30 AM GMT").
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bestPostingDays: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING },
              days: { type: Type.ARRAY, items: { type: Type.STRING } },
              timeWindow: { type: Type.STRING }
            },
            required: ["explanation", "days", "timeWindow"]
          },
          topicCadence: {
            type: Type.OBJECT,
            properties: {
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    type: { type: Type.STRING }
                  },
                  required: ["day", "type"]
                }
              },
              psychology: { type: Type.STRING }
            },
            required: ["schedule", "psychology"]
          },
          weeklySystem: {
            type: Type.OBJECT,
            properties: {
              routine: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    action: { type: Type.STRING }
                  },
                  required: ["day", "action"]
                }
              }
            },
            required: ["routine"]
          },
          postIdeas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                idea: { type: Type.STRING }
              },
              required: ["category", "idea"]
            }
          },
          hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
          ctas: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["bestPostingDays", "topicCadence", "weeklySystem", "postIdeas", "hooks", "ctas"]
      }
    }
  });

  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr) as PostingStrategy;
};
