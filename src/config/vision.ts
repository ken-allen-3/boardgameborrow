const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const visionClient = {
  textDetection: async ({ image }: { image: { content: string } }) => {
    try {
      const url = `${API_URL}/analyzeImage`;
      console.log('Vision API Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: image.content }),
      });

      const contentType = response.headers.get('content-type');
      let errorDetail = '';
      
      try {
        const responseText = await response.text();
        if (contentType?.includes('application/json')) {
          const data = JSON.parse(responseText);
          errorDetail = JSON.stringify(data, null, 2);
        } else {
          errorDetail = responseText;
        }
      } catch (parseError) {
        errorDetail = 'Could not parse response body';
      }

      if (!response.ok) {
        throw new Error(
          `Vision API Error:\n` +
          `Status: ${response.status} ${response.statusText}\n` +
          `URL: ${url}\n` +
          `Content-Type: ${contentType}\n` +
          `Response: ${errorDetail}`
        );
      }

      const data = JSON.parse(errorDetail);
      const { rawResponse } = data;
      return [rawResponse];
    } catch (error) {
      console.error('Vision API Error:', error);
      throw error;
    }
  }
};
