import { cn } from './utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('c1', 'c2')).toBe('c1 c2');
  });

  it('should handle conditional classes', () => {
    expect(cn('c1', true && 'c2', false && 'c3')).toBe('c1 c2');
  });

  it('should merge tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});
