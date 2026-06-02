import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrencyCode, DEFAULT_CURRENCY, CURRENCIES, formatMoney, toBaseALL } from '../constants/currencies';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Format a base (Lekë) amount in the active currency. */
  format: (allAmount: number) => string;
  /** Convert an amount typed in the active currency to Lekë (base). */
  toALL: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
const STORAGE_KEY = 'shitje.currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(v => {
        if (v && CURRENCIES.some(c => c.code === v)) setCurrencyState(v as CurrencyCode);
      })
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
  }, []);

  const format = useCallback((allAmount: number) => formatMoney(allAmount, currency), [currency]);
  const toALL = useCallback((amount: number) => toBaseALL(amount, currency), [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, toALL }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
