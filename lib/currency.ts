// Global currency configuration
// Default: Indonesian Rupiah (IDR)
// This ensures all currency formatting is consistent across the app

export const CURRENCY = {
  code: 'IDR',
  symbol: 'Rp',
  locale: 'id-ID',
} as const

/**
 * Format a number as Indonesian Rupiah (IDR)
 * @param amount - The numeric amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "Rp 1.234.567,89")
 */
export function formatCurrency(
  amount: number,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    showSymbol?: boolean
  }
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showSymbol = true,
  } = options || {}

  const formatted = new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)

  // The Intl formatter already includes the currency symbol
  return formatted
}

/**
 * Format a number as IDR without currency symbol (just the number with separators)
 * Useful for display in tables or when symbol is shown separately
 * @param amount - The numeric amount to format
 * @returns Formatted number string (e.g., "1.234.567,89")
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get the currency symbol
 * @returns Currency symbol (e.g., "Rp")
 */
export function getCurrencySymbol(): string {
  return CURRENCY.symbol
}
