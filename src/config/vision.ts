const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
      
      let errorDetail = '';
      
      try {
        const responseText = await response.text();
        console.log('Vision API Raw Response:', responseText);
        
        if (contentType?.includes('application/json')) {
          const data = JSON.parse(responseText);
          errorDetail = JSON.stringify(data, null, 2);
        } else {
          errorDetail = responseText;
        }
      } catch (parseError) {
        console.error('Vision API Parse Error:', parseError);
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
      // Enhanced error logging
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network Error Details:', {
          apiUrl: API_URL,
          fullUrl: `${API_URL}/analyzeImage`,
          env: import.meta.env,
          error
        });
      }
      throw error;
    }
  }
};
