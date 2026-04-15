import { cn } from '../utils';

describe('cn utility function', () => {
  it('combines class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const condition = true;
    expect(cn('base', condition && 'active', !condition && 'inactive')).toBe('base active');
  });

  it('handles Tailwind CSS conflicts correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles empty strings and undefined', () => {
    expect(cn('class1', '', undefined, 'class2')).toBe('class1 class2');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('handles objects with boolean values', () => {
    expect(cn({ 'class1': true, 'class2': false, 'class3': true })).toBe('class1 class3');
  });

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });
});