export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee'
  }
];

export const DEFAULT_CURRENCY = CURRENCIES[0];

export const formatCurrency = (amount: number, currency: Currency = DEFAULT_CURRENCY) => {
  return `${currency.symbol}${amount.toFixed(2)}`;
};
