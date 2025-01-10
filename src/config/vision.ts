// Ensure we have a default API URL if environment variable is not set
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is required');
}

export const visionClient = {
  textDetection: async ({ image }: { image: { content: string } }) => {
    try {
      // Log environment and URL construction details
      console.log('Environment API_URL:', API_URL);
      console.log('import.meta.env:', import.meta.env);
      
      const url = `${API_URL}/api/vision/analyze`;
      console.log('Final Vision API URL:', url);
      
      // Test the URL with a preflight request first
      try {
        const preflightResponse = await fetch(url, { 
          method: 'OPTIONS',
          headers: {
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Accept'
          }
        });
        console.log('Preflight response:', {
          ok: preflightResponse.ok,
          status: preflightResponse.status,
          headers: Object.fromEntries(preflightResponse.headers.entries())
        });
      } catch (preflightError) {
        console.error('Preflight request failed:', preflightError);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ image: image.content }),
      });

      const contentType = response.headers.get('content-type');
      console.log('Vision API Response Status:', response.status);
      console.log('Vision API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Vision API Error:\n` +
          `Status: ${response.status} ${response.statusText}\n` +
          `URL: ${url}\n` +
          `Content-Type: ${contentType}\n` +
          `Response: ${errorText}`
        );
      }

      const responseText = await response.text();
      console.log('Vision API Raw Response:', responseText);
      
      const data = JSON.parse(responseText);
      console.log('Parsed Vision API Response:', data);
      return data;
    } catch (error) {
      // Enhanced error logging
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network Error Details:', {
          apiUrl: API_URL,
          fullUrl: `${API_URL}/api/vision/analyze`,
          env: import.meta.env,
          error
        });
      }
      throw error;
    }
  }
};
