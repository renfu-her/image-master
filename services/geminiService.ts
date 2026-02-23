import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
// Note: In a real production app, you might proxy this through a backend to hide the key,
// or require the user to input their own key for heavy usage.
const ai = new GoogleGenAI({ apiKey });

/**
 * Converts a File object to a Base64 string (minus the data URL prefix)
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Uses Gemini Vision to analyze an image
 */
export const analyzeImage = async (base64Image: string, prompt: string) => {
  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, acts as generic image container
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("無法分析圖片，請稍後再試。");
  }
};

/**
 * Uses Gemini Image Generation to edit/transform an image
 * Note: 'gemini-2.5-flash-image' acts as the vision/generation hybrid for this purpose.
 */
export const editImageWithAI = async (base64Image: string, prompt: string) => {
  try {
    // Using flash-image for efficient image editing/generation tasks
    const model = 'gemini-2.5-flash-image'; 
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image
            }
          },
          { text: `Edit this image: ${prompt}. Return only the image.` }
        ]
      }
    });

    // Extract image from response
    // The response might contain text or inlineData. We look for inlineData.
    let generatedImageBase64 = null;
    
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData) {
                generatedImageBase64 = part.inlineData.data;
                break;
            }
        }
    }

    if (!generatedImageBase64) {
      throw new Error("模型未返回圖片，請嘗試不同的提示詞。");
    }

    return `data:image/png;base64,${generatedImageBase64}`;

  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw new Error("圖片生成失敗，請檢查 API Key 或稍後再試。");
  }
};
