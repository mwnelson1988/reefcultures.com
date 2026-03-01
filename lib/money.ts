export function formatUSDFromCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
