import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Sends an image and a prompt to Gemini to perform the transformation.
 * Uses gemini-2.5-flash-image for efficient image editing/generation.
 */
export const generateFashionTransformation = async (
  base64Image: string, 
  prompt: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  
  // Determine mime type roughly (defaulting to jpeg if unknown, though usually present in the prefix)
  const mimeType = base64Image.match(/^data:([^;]+);/)?.[1] || "image/jpeg";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ]
      },
      config: {
        // We do not set responseMimeType for image models as per guidelines
        // We let the model decide the best parameters for the image generation
      }
    });

    // Parse the response to find the generated image
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          // Construct the data URL
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image was returned by the AI model. Please try a different prompt.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to transform image.");
  }
};