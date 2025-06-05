import { render, screen } from '@testing-library/react';
import { FC } from 'react';
import { IntlProvider } from 'react-intl';
import { describe, it, expect } from 'vitest';

import { useTranslation } from './useTranslation';

const messages = {
  en: {
    'test.message': 'Hello, {name}!',
    'test.simple': 'Simple message',
  },
  fr: {
    'test.message': 'Bonjour, {name}!',
    'test.simple': 'Message simple',
  },
};

const TestComponent: FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div data-testid="simple-message">{t('test.simple')}</div>
      <div data-testid="interpolated-message">
        {t('test.message', undefined, { name: 'John' })}
      </div>
      <div data-testid="default-message">
        {t('test.nonexistent', 'Default message')}
      </div>
    </div>
  );
};

describe('useTranslation', () => {
  it('translates messages correctly in English', () => {
    render(
      <IntlProvider messages={messages.en} locale="en">
        <TestComponent />
      </IntlProvider>
    );

    expect(screen.getByTestId('simple-message')).toHaveTextContent('Simple message');
    expect(screen.getByTestId('interpolated-message')).toHaveTextContent('Hello, John!');
    expect(screen.getByTestId('default-message')).toHaveTextContent('Default message');
  });

  it('translates messages correctly in French', () => {
    render(
      <IntlProvider messages={messages.fr} locale="fr">
        <TestComponent />
      </IntlProvider>
    );

    expect(screen.getByTestId('simple-message')).toHaveTextContent('Message simple');
    expect(screen.getByTestId('interpolated-message')).toHaveTextContent('Bonjour, John!');
    expect(screen.getByTestId('default-message')).toHaveTextContent('Default message');
  });
});