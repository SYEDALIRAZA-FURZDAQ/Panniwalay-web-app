import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'PKR' | 'USD' | 'AED' | 'SAR' | 'EUR';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatMoney: (amountInPKR: number | string | null | undefined) => string;
  rates: Record<CurrencyCode, number>;
}

const DEFAULT_RATES: Record<CurrencyCode, number> = {
  PKR: 1,
  USD: 0.0036,
  AED: 0.0132,
  SAR: 0.0135,
  EUR: 0.0033,
};

const SYMBOLS: Record<CurrencyCode, string> = {
  PKR: 'PKR',
  USD: '$',
  AED: 'AED',
  SAR: 'SAR',
  EUR: '€',
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('PKR');

  const formatMoney = (amountInPKR: number | string | null | undefined): string => {
    const pkr = typeof amountInPKR === 'string' ? parseFloat(amountInPKR) : (amountInPKR || 0);
    const rate = DEFAULT_RATES[currency] || 1;
    const converted = pkr * rate;

    if (currency === 'PKR') {
      return `PKR ${pkr.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
    }

    return `${SYMBOLS[currency]} ${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatMoney, rates: DEFAULT_RATES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
