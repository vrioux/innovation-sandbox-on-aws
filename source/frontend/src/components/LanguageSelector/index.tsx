import { Select } from '@cloudscape-design/components';
import React from 'react';
import { useIntl } from 'react-intl';

import { useLocale } from '../../i18n/IntlProvider';
import { SUPPORTED_LOCALES } from '../../i18n/config';

const languageNames = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
  de: 'Deutsch',
} as const;

export const LanguageSelector: React.FC = () => {
  const { locale, setLocale } = useLocale();
  const intl = useIntl();

  return (
    <Select
      selectedOption={{ value: locale, label: languageNames[locale] }}
      onChange={({ detail }) => {
        setLocale(detail.selectedOption.value as typeof SUPPORTED_LOCALES[number]);
      }}
      options={SUPPORTED_LOCALES.map((loc: typeof SUPPORTED_LOCALES[number]) => ({
        value: loc,
        label: languageNames[loc],
      }))}
      ariaLabel={intl.formatMessage({ id: 'language.selector.label', defaultMessage: 'Select language' })}
    />
  );
};