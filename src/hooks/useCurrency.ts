'use client';

import { useState, useEffect } from 'react';

export type Currency = 'NGN' | 'USD';

interface CurrencyContext {
  currency: Currency;
  symbol: string;
  exchangeRate: number;
  countryCode: string;
  formatPrice: (amountInUSD: number) => string;
  setCurrency: (c: Currency) => void;
}

export function useCurrency(): CurrencyContext {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [countryCode, setCountryCode] = useState<string>('US');
  const exchangeRate = Number(process.env.NEXT_PUBLIC_USD_TO_NGN_RATE) || 1400;

  useEffect(() => {
    async function detectLocation() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && data.country_code) {
          setCountryCode(data.country_code);
          if (data.country_code === 'NG') {
            setCurrency('NGN');
          } else {
            setCurrency('USD');
          }
        }
      } catch (err) {
        // Fallback default
        setCurrency('USD');
      }
    }

    detectLocation();
  }, []);

  const formatPrice = (amountInUSD: number) => {
    if (currency === 'NGN') {
      const amountInNGN = Math.round(amountInUSD * exchangeRate);
      return `₦${amountInNGN.toLocaleString()}`;
    }
    return `$${amountInUSD.toFixed(0)}`;
  };

  const symbol = currency === 'NGN' ? '₦' : '$';

  return {
    currency,
    symbol,
    exchangeRate,
    countryCode,
    formatPrice,
    setCurrency,
  };
}