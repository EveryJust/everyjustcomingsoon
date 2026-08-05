export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: 'https://flagcdn.com/w20/in.png'
  }
];

export const DEFAULT_CURRENCY = CURRENCIES[0];

export const formatCurrency = (amount: number, currency: Currency = DEFAULT_CURRENCY) => {
  return `${currency.symbol}${amount.toFixed(2)}`;
};
