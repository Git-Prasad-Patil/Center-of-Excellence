export function parsePrice(text: string): number {
  // Anchored on the trailing digit run so a currency abbreviation's own
  // period (e.g. "Rs." in "Rs. 500") isn't mistaken for a decimal point.
  const match = text.match(/([\d,]+(?:\.\d+)?)\s*$/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : NaN;
}
