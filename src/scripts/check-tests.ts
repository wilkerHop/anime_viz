import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

// Regex to detect exported functions/classes
const EXPORTED_FUNCTION_REGEX = /export\s+(async\s+)?(function\s+\w+|const\s+\w+\s*=\s*(\(.*\)|async\s*\(.*\))\s*=>|class\s+\w+)/;

function getChangedFiles(): string[] {
  try {
    // Get list of changed files between HEAD and previous commit
    // In CI, we might need to adjust this depending on how checkout is done
    const output = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf-8' });
    return output.split('\n').filter(Boolean).map(f => path.resolve(process.cwd(), f));
  } catch (error) {
    console.warn('Could not determine changed files via git diff. Checking all files? No, skipping.');
    return [];
  }
}

function hasExportedFunction(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return EXPORTED_FUNCTION_REGEX.test(content);
  } catch (error) {
    return false;
  }
}

function checkTests() {
  const changedFiles = getChangedFiles();
  const missingTests: string[] = [];

  console.log(`Checking ${changedFiles.length} changed files for test coverage...`);

  for (const filePath of changedFiles) {
    // Only check .ts files in src/
    if (!filePath.startsWith(SRC_DIR) || !filePath.endsWith('.ts') || filePath.endsWith('.d.ts')) {
      continue;
    }

    // Ignore test files themselves
    if (filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts')) {
      continue;
    }

    // Ignore Next.js specific files (pages, layouts) usually covered by E2E
    if (filePath.match(/(page|layout|loading|error|not-found|global-error|route|template)\.ts$/)) {
      continue;
    }

    // Check if file has exported functions
    if (hasExportedFunction(filePath)) {
      const dir = path.dirname(filePath);
      const basename = path.basename(filePath, '.ts');
      const testFile = path.join(dir, `${basename}.test.ts`);

      if (!fs.existsSync(testFile)) {
        missingTests.push(path.relative(process.cwd(), filePath));
      }
    }
  }

  if (missingTests.length > 0) {
    console.error('❌ The following files have exported functions but are missing test suites:');
    missingTests.forEach(f => console.error(`   - ${f}`));
    console.error('\nPlease create a corresponding .test.ts file for each.');
    process.exit(1);
  } else {
    console.log('✅ All changed files have corresponding test suites.');
  }
}

checkTests();
