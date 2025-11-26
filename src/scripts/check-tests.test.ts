import { execSync } from 'child_process';
import fs from 'fs';
import { checkTests, EXPORTED_FUNCTION_REGEX, getChangedFiles, hasExportedFunction } from './check-tests';

jest.mock('fs');
jest.mock('child_process');

describe('check-tests script', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`Process.exit called with code ${code}`);
  });
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
    (execSync as jest.Mock).mockReturnValue('');
    (fs.readFileSync as jest.Mock).mockReturnValue('');
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  afterAll(() => {
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('EXPORTED_FUNCTION_REGEX', () => {
    it('should match exported functions', () => {
      expect(EXPORTED_FUNCTION_REGEX.test('export function foo() {}')).toBe(true);
      expect(EXPORTED_FUNCTION_REGEX.test('export async function foo() {}')).toBe(true);
      expect(EXPORTED_FUNCTION_REGEX.test('export const foo = () => {}')).toBe(true);
      expect(EXPORTED_FUNCTION_REGEX.test('export const foo = async () => {}')).toBe(true);
      expect(EXPORTED_FUNCTION_REGEX.test('export class Foo {}')).toBe(true);
    });

    it('should not match non-exported functions', () => {
      expect(EXPORTED_FUNCTION_REGEX.test('function foo() {}')).toBe(false);
      expect(EXPORTED_FUNCTION_REGEX.test('const foo = () => {}')).toBe(false);
    });
  });

  describe('getChangedFiles', () => {
    it('should return list of changed files', () => {
      (execSync as jest.Mock).mockReturnValue('file1.ts\nfile2.ts\n');
      const files = getChangedFiles();
      expect(files).toHaveLength(2);
      expect(files[0]).toContain('file1.ts');
    });

    it('should handle empty output', () => {
      (execSync as jest.Mock).mockReturnValue('');
      const files = getChangedFiles();
      expect(files).toHaveLength(0);
    });
  });

  describe('hasExportedFunction', () => {
    it('should return true if file has exported function', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('export function test() {}');
      expect(hasExportedFunction('test.ts')).toBe(true);
    });

    it('should return false if file has no exported function', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('const foo = 1;');
      expect(hasExportedFunction('test.ts')).toBe(false);
    });
  });

  describe('checkTests', () => {
    it('should pass if all changed files have tests', () => {
      (execSync as jest.Mock).mockReturnValue('src/foo.ts\n');
      (fs.readFileSync as jest.Mock).mockReturnValue('export function foo() {}');
      (fs.existsSync as jest.Mock).mockReturnValue(true); // foo.test.ts exists

      checkTests();

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('All changed files have corresponding test suites'));
      expect(mockExit).not.toHaveBeenCalled();
    });

    it('should fail if a changed file is missing test', () => {
      (execSync as jest.Mock).mockReturnValue('src/foo.ts\n');
      (fs.readFileSync as jest.Mock).mockReturnValue('export function foo() {}');
      (fs.existsSync as jest.Mock).mockReturnValue(false); // foo.test.ts missing

      expect(() => checkTests()).toThrow('Process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('missing test suites'));
    });

    it('should ignore non-ts files', () => {
      (execSync as jest.Mock).mockReturnValue('src/foo.css\n');
      checkTests();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('All changed files have corresponding test suites'));
    });

    it('should ignore test files', () => {
      (execSync as jest.Mock).mockReturnValue('src/foo.test.ts\n');
      checkTests();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('All changed files have corresponding test suites'));
    });
    
    it('should ignore Next.js page files', () => {
      (execSync as jest.Mock).mockReturnValue('src/app/page.ts\n');
      (fs.readFileSync as jest.Mock).mockReturnValue('export default function Page() {}');
      checkTests();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('All changed files have corresponding test suites'));
    });
  });
});
