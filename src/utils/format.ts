/**
 * Formats financial amounts exactly as entered without adding artificial trailing decimal zeros.
 * e.g. 500 -> "500", 1250 -> "1,250", 150.5 -> "150.5", 1250.75 -> "1,250.75"
 */
export function formatAmount(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0';

  if (Number.isInteger(num)) {
    return num.toLocaleString('en-US');
  }

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}
