import { createIntl, createIntlCache } from 'react-intl';

import enMessages from './messages/en.json';
import frMessages from './messages/fr.json';
import esMessages from './messages/es.json';
import ptMessages from './messages/pt.json';
import itMessages from './messages/it.json';
import deMessages from './messages/de.json';
import jpMessages from './messages/jp.json';

export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'pt', 'it', 'de', 'jp'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

// Use Record<string, string> to allow different keys in different language files
type MessageDictionary = Record<string, string>;

type Messages = {
  [key in SupportedLocale]: MessageDictionary;
};

export const messages: Messages = {
  en: enMessages,
  fr: frMessages,
  es: esMessages,
  pt: ptMessages,
  it: itMessages,
  de: deMessages,
  jp: jpMessages,
};

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