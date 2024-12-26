import express from 'express';
import cors from 'cors';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Ensure credentials are properly loaded
const credentialsPath = path.join(__dirname, 'vision-credentials.json');

// Function to decode and save credentials
const setupCredentials = () => {
  const encodedCreds = process.env.VITE_GOOGLE_CLOUD_VISION_CREDENTIALS;
  if (!encodedCreds) {
    throw new Error('Missing Google Cloud Vision credentials in environment variables');
  }

  try {
    const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8');
    fs.writeFileSync(credentialsPath, decodedCreds);
    console.log('Credentials file created successfully');
  } catch (error) {
    console.error('Error creating credentials file:', error);
    throw error;
  }
};

// Initialize Vision client
let visionClient: ImageAnnotatorClient;
try {
  setupCredentials();
  visionClient = new ImageAnnotatorClient({
    keyFilename: credentialsPath,
    projectId: process.env.VITE_GOOGLE_CLOUD_PROJECT_ID
  });
  console.log('Vision client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Vision client:', error);
  process.exit(1);
}

app.use(cors({
  origin: ['http://localhost:5174', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Add a test endpoint
app.get('/api/vision/test', (req, res) => {
  res.json({ message: 'Vision API server is running' });
});

app.post('/api/vision/analyze', async (req, res) => {
  try {
    console.log('Received analyze request');
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Remove data URL prefix if present
    const imageData = image.replace(/^data:image\/\w+;base64,/, '');
    
    console.log('Sending request to Vision API...');
    // Perform text detection
    const [result] = await visionClient.textDetection({
      image: { content: imageData }
    });

    console.log('Received Vision API response');
    res.json(result);
  } catch (error) {
    console.error('Vision API Error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

app.listen(port, () => {
  console.log(`Vision API proxy server running on port ${port}`);
});

// Cleanup credentials file on exit
process.on('SIGINT', () => {
  try {
    if (fs.existsSync(credentialsPath)) {
      fs.unlinkSync(credentialsPath);
      console.log('Cleaned up credentials file');
    }
  } catch (error) {
    console.error('Error cleaning up credentials:', error);
  }
  process.exit();
});
