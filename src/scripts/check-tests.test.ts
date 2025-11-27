import fs from 'fs';
import { glob } from 'glob';
import { checkTests, EXPORTED_FUNCTION_REGEX, getAllSrcFiles, hasExportedFunction } from './check-tests';

jest.mock('fs');
jest.mock('glob', () => ({
  glob: {
    sync: jest.fn(),
  },
}));

describe('check-tests script', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`Process.exit called with code ${code}`);
  });
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('getAllSrcFiles', () => {
    it('should return list of files from glob', () => {
      (glob.sync as jest.Mock).mockReturnValue(['src/file1.ts', 'src/file2.tsx']);
      const files = getAllSrcFiles();
      expect(files).toHaveLength(2);
      expect(files).toContain('src/file1.ts');
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
    it('should pass if all files have tests', () => {
      (glob.sync as jest.Mock).mockReturnValue(['src/foo.ts']);
      (fs.readFileSync as jest.Mock).mockReturnValue('export function foo() {}');
      (fs.existsSync as jest.Mock).mockReturnValue(true); // foo.test.ts exists

      checkTests();

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('All applicable files have corresponding test suites'));
      expect(mockExit).not.toHaveBeenCalled();
    });

    it('should fail if a file is missing test', () => {
      (glob.sync as jest.Mock).mockReturnValue(['src/foo.ts']);
      (fs.readFileSync as jest.Mock).mockReturnValue('export function foo() {}');
      (fs.existsSync as jest.Mock).mockReturnValue(false); // foo.test.ts missing

      expect(() => checkTests()).toThrow('Process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('missing test suites'));
    });

    it('should ignore script files', () => {
      (glob.sync as jest.Mock).mockReturnValue(['src/scripts/foo.ts']);
      checkTests();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('All applicable files have corresponding test suites'));
    });
    
    it('should ignore Next.js page files', () => {
      (glob.sync as jest.Mock).mockReturnValue(['src/app/page.tsx']);
      (fs.readFileSync as jest.Mock).mockReturnValue('export default function Page() {}');
      checkTests();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('All applicable files have corresponding test suites'));
    });
  });
});
