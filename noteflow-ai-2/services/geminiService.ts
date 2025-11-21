import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNoteContent = async (prompt: string, currentContent: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash'; 
    
    const fullPrompt = `
      You are a helpful AI writing assistant within a note-taking app.
      
      User Request: ${prompt}
      
      Current Note Context:
      "${currentContent}"
      
      Output only the text to be added or replaced. Do not include conversational filler like "Here is the text".
      If the user asks to summarize, provide the summary.
      If the user asks to continue writing, continue the thought flow naturally.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateTitle = async (content: string): Promise<string> => {
    try {
        if (!content || content.length < 10) return "Untitled Note";
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, concise (max 5 words) title for this note content. Do not use quotes. Content: ${content.substring(0, 500)}`
        });
        return response.text?.trim() || "Untitled Note";
    } catch (error) {
        return "Untitled Note";
    }
}
