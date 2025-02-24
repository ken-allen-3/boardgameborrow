import fs from 'fs';
import path from 'path';
import https from 'https';
import onboardingGames from '../config/onboardingGames.json';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const GAMES_DIR = path.join(PUBLIC_DIR, 'games', 'onboarding');

// Ensure directories exist
if (!fs.existsSync(GAMES_DIR)) {
  fs.mkdirSync(GAMES_DIR, { recursive: true });
}

function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded: ${filepath}`);
          resolve();
        });
      } else {
        response.resume(); // Consume response to free up memory
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete failed download
      reject(err);
    });
  });
}

function getImageExtension(url: string): string {
  const match = url.match(/\.(?:jpg|jpeg|png|webp|gif)$/i);
  return match ? match[0] : '.jpg';
}

async function downloadAllImages() {
  const categories = Object.keys(onboardingGames) as Array<keyof typeof onboardingGames>;
  const updatedGames = { ...onboardingGames };
  
  for (const category of categories) {
    console.log(`Processing ${category} games...`);
    
    for (const game of onboardingGames[category]) {
      const extension = getImageExtension(game.image);
      const filename = `${game.id}${extension}`;
      const filepath = path.join(GAMES_DIR, filename);
      
      try {
        if (!fs.existsSync(filepath)) {
          await downloadImage(game.image, filepath);
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
  const jsonPath = path.join(process.cwd(), 'src', 'config', 'onboardingGames.json');
  fs.writeFileSync(jsonPath, JSON.stringify(updatedGames, null, 2));
  console.log('Updated onboardingGames.json with local image paths');
}

downloadAllImages().catch(console.error);
