import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import seedData from '../config/seedData.json' assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESOURCE_TYPES = {
  gameImages: {
    urlKey: 'image_url',
    outputDir: 'public/games',
    filenameKey: 'id',
    extension: '.jpg'
  }
};

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        response.resume(); // Consume response to free up memory
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function cacheResources(sourceData, config, options = {}) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  console.log(`\nCaching resources to ${config.outputDir}...`);
  let cached = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of sourceData) {
    const url = item[config.urlKey];
    if (!url) {
      console.warn(`No URL found for item ${item[config.filenameKey]}`);
      continue;
    }

    const outputPath = path.join(
      config.outputDir,
      `${item[config.filenameKey]}${config.extension}`
    );

    // Skip if file exists and force is false
    if (fs.existsSync(outputPath) && !options.force) {
      skipped++;
      continue;
    }

    try {
      await downloadFile(url, outputPath);
      cached++;
      process.stdout.write('.');  // Progress indicator
    } catch (error) {
      failed++;
      console.error(`\nFailed to cache ${url}:`, error);
    }
  }

  console.log(`\n\nResults for ${config.outputDir}:`);
  console.log(`  Cached: ${cached}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
}

async function main() {
  // Cache game images
  await cacheResources(seedData.games, RESOURCE_TYPES.gameImages);
}

// Run the script
main().catch(console.error);
