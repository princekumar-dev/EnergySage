import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, location: string): string {
  const currencyMap: Record<string, { code: string; symbol: string }> = {
    'US': { code: 'USD', symbol: '$' },
    'UK': { code: 'GBP', symbol: '£' },
    'India': { code: 'INR', symbol: '₹' },
    'Germany': { code: 'EUR', symbol: '€' },
    'Australia': { code: 'AUD', symbol: 'A$' },
    'Japan': { code: 'JPY', symbol: '¥' },
    'Canada': { code: 'CAD', symbol: 'C$' }
  };

  const currency = currencyMap[location] || currencyMap['US'];
  
  // Amount is already in local currency from API, no conversion needed
  // Special formatting for Indian Rupees (lakhs and crores)
  if (location === 'India') {
    if (amount >= 10000000) { // 1 crore
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) { // 1 lakh
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    } else {
      return `₹${amount.toFixed(2)}`;
    }
  }

  // Special formatting for Japanese Yen (no decimals)
  if (location === 'Japan') {
    if (amount >= 1000000) {
      return `¥${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `¥${(amount / 1000).toFixed(0)}k`;
    } else {
      return `¥${Math.round(amount)}`;
    }
  }

  // Standard formatting for other currencies
  if (amount >= 1000000) {
    return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${currency.symbol}${(amount / 1000).toFixed(1)}k`;
  } else {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
}