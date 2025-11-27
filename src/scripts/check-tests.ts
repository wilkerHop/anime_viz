import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

// Regex to detect exported functions/classes
export const EXPORTED_FUNCTION_REGEX = /export\s+(async\s+)?(function\s+\w+|const\s+\w+\s*=\s*(\(.*\)|async\s*\(.*\))\s*=>|class\s+\w+)/;

export function getAllSrcFiles(): string[] {
  return glob.sync('src/**/*.{ts,tsx}', { 
    cwd: process.cwd(), 
    absolute: true,
    ignore: [
      '**/*.d.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/node_modules/**',
    ]
  });
}

export function hasExportedFunction(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return EXPORTED_FUNCTION_REGEX.test(content);
  } catch (error) {
    return false;
  }
}

export function checkTests() {
  const allFiles = getAllSrcFiles();
  const missingTests: string[] = [];

  console.log(`Checking ${allFiles.length} files for test coverage...`);

  for (const filePath of allFiles) {
    // Ignore Next.js specific files (pages, layouts) usually covered by E2E
    if (filePath.match(/(page|layout|loading|error|not-found|global-error|route|template|default)\.tsx?$/)) {
      continue;
    }
    
    // Ignore script files
    if (filePath.includes('/scripts/')) {
      continue;
    }

    // Check if file has exported functions
    if (hasExportedFunction(filePath)) {
      const dir = path.dirname(filePath);
      const basename = path.basename(filePath, path.extname(filePath));
      const testFileTs = path.join(dir, `${basename}.test.ts`);
      const testFileTsx = path.join(dir, `${basename}.test.tsx`);

      if (!fs.existsSync(testFileTs) && !fs.existsSync(testFileTsx)) {
        missingTests.push(path.relative(process.cwd(), filePath));
      }
    }
  }

  if (missingTests.length > 0) {
    console.error('❌ The following files have exported functions but are missing test suites:');
    missingTests.forEach(f => console.error(`   - ${f}`));
    console.error('\nPlease create a corresponding .test.ts or .test.tsx file for each.');
    process.exit(1);
  } else {
    console.log('✅ All applicable files have corresponding test suites.');
  }
}

// Execute only if run directly
if (process.argv[1] && process.argv[1].endsWith('check-tests.ts')) {
  checkTests();
}
