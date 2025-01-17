import fs from 'fs';
import path from 'path';
import https from 'https';
import seedData from '../config/seedData.json';

interface ResourceConfig {
  urlKey: string;          // Key in source data containing URL
  outputDir: string;       // Directory to save files
  filenameKey: string;     // Key in source data to use for filename
  extension: string;       // File extension to use
}

const RESOURCE_TYPES = {
  gameImages: {
    urlKey: 'thumb_url',
    outputDir: 'public/games',
    filenameKey: 'id',
    extension: '.jpg'
  },
  // Add more resource types here as needed, for example:
  // userAvatars: {
  //   urlKey: 'photoUrl',
  //   outputDir: 'public/avatars',
  //   filenameKey: 'id',
  //   extension: '.jpg'
  // }
};

async function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
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

async function cacheResources(
  sourceData: any[],
  config: ResourceConfig,
  options: { force?: boolean } = {}
): Promise<void> {
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

  // Add more resource caching here as needed
  // For example:
  // await cacheResources(seedData.users, RESOURCE_TYPES.userAvatars);
}

// Run the script
main().catch(console.error);
