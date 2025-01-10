import express from 'express';
import cors from 'cors';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GameDetectionService } from './services/gameDetection';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Function to decode and write credentials to a file
const setupCredentials = () => {
  const encodedCreds = process.env.GOOGLE_CLOUD_VISION_CREDENTIALS;
  if (!encodedCreds) {
    throw new Error('Missing GOOGLE_CLOUD_VISION_CREDENTIALS environment variable');
  }

  const credentialsPath = path.join(__dirname, 'vision-credentials.json');
  
  try {
    // Decode base64 credentials
    const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8');
    
    // Write credentials to file
    fs.writeFileSync(credentialsPath, decodedCreds);
    console.log('Credentials file created successfully');
    
    return credentialsPath;
  } catch (error) {
    console.error('Error setting up credentials:', error);
    throw error;
  }
};

// Initialize Vision client
let visionClient: ImageAnnotatorClient;
try {
  const credentialsPath = setupCredentials();
  visionClient = new ImageAnnotatorClient({
    keyFilename: credentialsPath,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
  });
  console.log('Vision client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Vision client:', error);
  process.exit(1);
}

const gameDetectionService = new GameDetectionService();

// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://boardgameshare.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/vision/analyze', async (req, res) => {
  try {
    console.log('Received analyze request');
    const { image } = req.body;
    
    if (!image) {
      console.error('No image data provided');
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Remove data URL prefix if present
    const imageData = image.replace(/^data:image\/\w+;base64,/, '');
    
    // Validate base64 data
    try {
      Buffer.from(imageData, 'base64');
    } catch (error) {
      console.error('Invalid base64 data:', error);
      return res.status(400).json({ error: 'Invalid image data' });
    }
    
    console.log('Sending request to Vision API...');
    
    // Perform text detection
    const [result] = await visionClient.textDetection({
      image: { content: imageData }
    });

    if (!result) {
      console.error('No result from Vision API');
      return res.status(500).json({ error: 'No response from Vision API' });
    }

    console.log('Vision API response received');

    // Process detected text to identify games
    const detectedGames = await gameDetectionService.processAnnotations(
      result.textAnnotations
    );

    console.log('Detected games:', detectedGames);

    res.json({
      detectedGames,
      rawResponse: result
    });
  } catch (error) {
    console.error('Vision API Error:', error);
    
    // Detailed error response
    const errorResponse = {
      error: 'Failed to analyze image',
      details: error instanceof Error ? {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        name: error.name
      } : 'Unknown error'
    };

    res.status(500).json(errorResponse);
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';
  console.error('Server Error:', err);
  
  // Don't expose stack traces in production
  res.status(500).json({
    error: 'Internal server error',
    message: isProduction ? 'An unexpected error occurred' : err.message,
    details: isProduction ? undefined : {
      stack: err.stack,
      name: err.name
    }
  });
});

// Cleanup function
const cleanup = () => {
  const credentialsPath = path.join(__dirname, 'vision-credentials.json');
  if (fs.existsSync(credentialsPath)) {
    fs.unlinkSync(credentialsPath);
    console.log('Cleaned up credentials file');
  }
};

// Cleanup on exit
process.on('SIGINT', () => {
  cleanup();
  process.exit();
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit();
});

app.listen(port, () => {
  console.log(`Vision API proxy server running on port ${port}`);
});
