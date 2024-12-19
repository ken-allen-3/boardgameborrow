import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

try {
  const lastCommitDate = execSync('git log -1 --format=%cd').toString().trim();
  const filePath = join(process.cwd(), 'src', 'lastCommitDate.json');
  writeFileSync(filePath, JSON.stringify({ lastCommitDate }));
  console.log('Last commit date written to src/lastCommitDate.json');
} catch (error) {
  console.error('Error getting last commit date:', error);
}