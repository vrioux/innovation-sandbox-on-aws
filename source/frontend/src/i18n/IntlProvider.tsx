import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { IntlProvider as ReactIntlProvider } from 'react-intl';

import { DEFAULT_LOCALE, getBrowserLocale, messages, SupportedLocale, SUPPORTED_LOCALES } from './config';

interface LocaleContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export const useLocale = () => useContext(LocaleContext);

interface Props {
  children: React.ReactNode;
}

export const IntlProvider: React.FC<Props> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    try {
      const savedLocale = localStorage.getItem('locale') as SupportedLocale;
      const browserLocale = getBrowserLocale();
      // First try the saved locale, then browser locale, then default
      if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
        return savedLocale;
      } else if (browserLocale && SUPPORTED_LOCALES.includes(browserLocale)) {
        localStorage.setItem('locale', browserLocale);
        return browserLocale;
      }
      return DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (SUPPORTED_LOCALES.includes(newLocale)) {
      setLocaleState(newLocale);
      try {
        localStorage.setItem('locale', newLocale);
      } catch (error) {
        console.warn('Failed to save locale to localStorage:', error);
      }
    }
  }, []);

  const contextValue = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  const currentMessages = useMemo(() => {
    // Ensure we have messages for the current locale
    const localeMessages = messages[locale];
    if (!localeMessages) {
      console.warn(`No messages found for locale ${locale}, falling back to ${DEFAULT_LOCALE}`);
      return messages[DEFAULT_LOCALE];
    }
    return localeMessages;
  }, [locale]);

  return (
    <LocaleContext.Provider value={contextValue}>
      <ReactIntlProvider
        messages={currentMessages}
        locale={locale}
        defaultLocale={DEFAULT_LOCALE}
        onError={(err) => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('React Intl Error:', err);
          }
        }}
      >
        {children}
      </ReactIntlProvider>
    </LocaleContext.Provider>
  );
};