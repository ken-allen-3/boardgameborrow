// Mock Vision API client for demo purposes
// In production, this would call a backend service that handles the Vision API calls

export const visionClient = {
  textDetection: async ({ image }: { image: { content: string } }) => {
    // Mock response that simulates detecting "Catan" and "Monopoly" in an image
    return [{
      textAnnotations: [
        // First annotation contains all text
        {
          description: "Catan\nMonopoly",
          boundingPoly: null
        },
        // Individual word annotations
        {
          description: "Catan",
          boundingPoly: {
            vertices: [
              { x: 100, y: 100 },
              { x: 200, y: 100 },
              { x: 200, y: 150 },
              { x: 100, y: 150 }
            ]
          }
        },
        {
          description: "Monopoly",
          boundingPoly: {
            vertices: [
              { x: 300, y: 200 },
              { x: 400, y: 200 },
              { x: 400, y: 250 },
              { x: 300, y: 250 }
            ]
          }
        }
      ]
    }];
  }
};