import { describe, it, expect } from 'vitest';
import { parsePrice } from '../features/support/money';

describe('parsePrice', () => {
  it('returns NaN for an empty string (Zero case)', () => {
    expect(parsePrice('')).toBeNaN();
  });

  it('parses a plain integer price (One case)', () => {
    expect(parsePrice('500')).toBe(500);
  });

  it('parses a price with a thousands separator and decimal (Many case)', () => {
    expect(parsePrice('1,234.56')).toBe(1234.56);
  });

  it('ignores a currency abbreviation prefix with its own period (Boundary case)', () => {
    expect(parsePrice('Rs. 500')).toBe(500);
  });

  it('parses a price with trailing whitespace (Boundary case)', () => {
    expect(parsePrice('500   ')).toBe(500);
  });

  it('parses the smallest positive decimal (Boundary case)', () => {
    expect(parsePrice('0.01')).toBe(0.01);
  });

  it('does not preserve a leading minus sign — known limitation (Boundary/Exception case)', () => {
    // The regex only anchors on a trailing digit run; it has no minus-sign
    // handling, so a negative price silently comes back positive instead of
    // throwing or returning NaN. Documented here as current behavior, not
    // desired behavior.
    expect(parsePrice('-500')).toBe(500);
  });

  it('returns NaN for text with no digits at all (Exception case)', () => {
    expect(parsePrice('N/A')).toBeNaN();
  });

  it('returns NaN when a number is followed by trailing non-numeric text (Exception case)', () => {
    // The trailing "$" anchor requires the digit run to be the last thing in
    // the string (whitespace aside). Without it, a regex would happily match
    // "500" out of "500 approx" and silently return the wrong thing instead
    // of signalling "this wasn't a clean trailing price."
    expect(parsePrice('500 approx')).toBeNaN();
  });
});
