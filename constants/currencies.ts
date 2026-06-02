export type CurrencyCode = 'EUR' | 'ALL' | 'USD';

interface CurrencyInfo {
  code: CurrencyCode;
  name: string; // Albanian display name
  symbol: string;
  allPerUnit: number; // how many Lekë are in 1 unit of this currency
  position: 'prefix' | 'suffix';
}

// Listing prices are stored in Lekë (ALL) as the base unit. These rates convert
// that base into the currency the user has chosen to view. EUR is the default.
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', allPerUnit: 100, position: 'prefix' },
  { code: 'ALL', name: 'Lekë', symbol: 'Lekë', allPerUnit: 1, position: 'suffix' },
  { code: 'USD', name: 'Dollar', symbol: '$', allPerUnit: 92, position: 'prefix' },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'EUR';

export function getCurrency(code: CurrencyCode): CurrencyInfo {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

/** Format a base (Lekë) amount in the chosen display currency. */
export function formatMoney(allAmount: number, code: CurrencyCode): string {
  const c = getCurrency(code);
  const value = Math.round(allAmount / c.allPerUnit);
  const num = value.toLocaleString(code === 'ALL' ? 'sq-AL' : 'en-US');
  return c.position === 'prefix' ? `${c.symbol}${num}` : `${num} ${c.symbol}`;
}

/** Convert an amount typed in `code` back to Lekë (base) for storage. */
export function toBaseALL(amount: number, code: CurrencyCode): number {
  return Math.round(amount * getCurrency(code).allPerUnit);
}
