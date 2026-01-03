
import { GoogleGenAI } from "@google/genai";
import { Todo } from "../types";

export const getProductivityInsight = async (todos: Todo[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const activeTasks = todos.filter(t => !t.completed).map(t => t.text).join(", ");
  const completedCount = todos.filter(t => t.completed).length;

  const prompt = `
    Based on the following tasks, provide a short, professional, and encouraging productivity tip.
    Active tasks: ${activeTasks || 'None'}
    Completed tasks: ${completedCount}
    
    Keep the response under 150 characters. Be concise but inspiring.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    return response.text || "Keep up the great work! Consistency is key.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Focus on one task at a time for maximum efficiency.";
  }
};
