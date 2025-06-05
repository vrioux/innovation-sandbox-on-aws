import { createIntl, createIntlCache } from 'react-intl';

import enMessages from './messages/en.json';
import frMessages from './messages/fr.json';

export const SUPPORTED_LOCALES = ['en', 'fr'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const messages = {
  en: enMessages,
  fr: frMessages,
} as const;

// This is optional but highly recommended since it prevents memory leaks
const cache = createIntlCache();

export const getIntl = (locale: SupportedLocale = DEFAULT_LOCALE) => {
  return createIntl(
    {
      locale: locale,
      messages: messages[locale],
    },
    cache
  );
};

export const getBrowserLocale = (): SupportedLocale => {
  const browserLocale = navigator.language.split('-')[0];
  return SUPPORTED_LOCALES.includes(browserLocale as SupportedLocale)
    ? (browserLocale as SupportedLocale)
    : DEFAULT_LOCALE;
};