import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import onboardingGames from '../config/onboardingGames.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const GAMES_DIR = path.join(PUBLIC_DIR, 'games', 'onboarding');

// Ensure directories exist
if (!fs.existsSync(GAMES_DIR)) {
  fs.mkdirSync(GAMES_DIR, { recursive: true });
}

function getImageUrl(gameId) {
  return new Promise((resolve, reject) => {
    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=0`;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    https.get(url, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          // Extract image URL from XML response
          const match = data.match(/<image>(.*?)<\/image>/);
          if (match && match[1]) {
            resolve(match[1]);
          } else {
            reject(new Error(`No image found for game ${gameId}`));
          }
        } else {
          reject(new Error(`Failed to get image URL for game ${gameId}: ${response.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    https.get(url, options, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded: ${filepath}`);
          resolve();
        });
      } else {
        response.resume();
        reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function downloadAllImages() {
  const categories = Object.keys(onboardingGames);
  const updatedGames = { ...onboardingGames };
  
  for (const category of categories) {
    console.log(`Processing ${category} games...`);
    
    for (const game of onboardingGames[category]) {
      const filename = `${game.id}.jpg`;
      const filepath = path.join(GAMES_DIR, filename);
      
      try {
        if (!fs.existsSync(filepath)) {
          const imageUrl = await getImageUrl(game.id);
          await downloadImage(imageUrl, filepath);
          // Add a small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Update image path in the games data
        const gameIndex = updatedGames[category].findIndex(g => g.id === game.id);
        if (gameIndex !== -1) {
          updatedGames[category][gameIndex] = {
            ...game,
            image: `/games/onboarding/${filename}`
          };
        }
      } catch (error) {
        console.error(`Error downloading ${game.name} image:`, error);
        // Keep the original URL if download fails
      }
    }
  }
  
  // Update the JSON file with new local paths
  const jsonPath = path.join(PROJECT_ROOT, 'src', 'config', 'onboardingGames.json');
  fs.writeFileSync(jsonPath, JSON.stringify(updatedGames, null, 2));
  console.log('Updated onboardingGames.json with local image paths');
}

downloadAllImages().catch(console.error);
