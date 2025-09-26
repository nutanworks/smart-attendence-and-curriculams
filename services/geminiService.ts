import { GoogleGenAI, Type } from "@google/genai";
import { ActivitySuggestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateActivities = async (interests: string, strengths: string, careerGoals: string): Promise<ActivitySuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `A student has a free period of about 60 minutes. Generate 3 personalized academic tasks for them.
      Student details:
      - Interests: ${interests}
      - Strengths: ${strengths}
      - Career Goals: ${careerGoals}
      
      Suggest productive activities that align with their profile.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A short, engaging title for the activity.",
              },
              description: {
                type: Type.STRING,
                description: "A brief explanation of the task and its benefits.",
              },
              duration: {
                type: Type.INTEGER,
                description: "Estimated time in minutes to complete the activity."
              }
            },
            required: ["title", "description", "duration"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    try {
        const parsedActivities = JSON.parse(jsonText) as Omit<ActivitySuggestion, 'id' | 'completed'>[];
        return parsedActivities.map(activity => ({
            ...activity,
            // FIX: The `substr` method is deprecated. Using `substring` instead.
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            completed: false,
        }));
    } catch(e) {
        console.error("Failed to parse JSON from Gemini:", e);
        return [
            {
                id: 'fallback-1',
                title: "Review Class Notes",
                description: "Could not parse AI suggestions. Please review your notes from the last class.",
                duration: 60,
                completed: false,
            }
        ];
    }

  } catch (error) {
    console.error("Error generating activities:", error);
    // Return a fallback suggestion on error
    return [
      {
        id: 'error-1',
        title: "Error Generating Suggestions",
        description: "Could not connect to the AI service. Please check your connection and API key. In the meantime, you could review your notes from the last class.",
        duration: 60,
        completed: false,
      }
    ];
  }
};
