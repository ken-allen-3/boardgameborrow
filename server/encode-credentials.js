const fs = require('fs');
const path = require('path');

// Get the filename from command line args or use default
const filename = process.argv[2] || 'vision-credentials.json';
// Read the JSON file
const credentialsPath = path.join(__dirname, filename);
const jsonContent = fs.readFileSync(credentialsPath, 'utf8');

// Convert to base64
const base64Encoded = Buffer.from(jsonContent).toString('base64');

console.log('Base64 encoded credentials:');
console.log(base64Encoded);

// Verify the encoding by decoding
const decoded = Buffer.from(base64Encoded, 'base64').toString('utf8');
const decodedJson = JSON.parse(decoded);

console.log('\nVerification:');
console.log('✓ Successfully decoded back to JSON');
console.log('✓ Contains required fields:', Object.keys(decodedJson).join(', '));
