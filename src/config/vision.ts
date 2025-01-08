const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const visionClient = {
  textDetection: async ({ image }: { image: { content: string } }) => {
    try {
      const response = await fetch(`${API_URL}/analyzeImage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: image.content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to analyze image: ${errorText}`);
      }

      const { rawResponse } = await response.json();
      return [rawResponse];
    } catch (error) {
      console.error('Vision API Error:', error);
      throw error;
    }
  }
};
