import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges and deduplicates tailwind classes', () => {
    expect(cn('px-2', 'px-4', 'text-sm')).toBe('px-4 text-sm');
  });

  it('handles conditional and falsy values', () => {
    expect(cn('base', false && 'hidden', null, undefined, ['active', 'base'])).toBe('base active base');
  });
});
