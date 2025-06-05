import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { IntlProvider, useLocale } from './IntlProvider';

const TestComponent: FC = () => {
  const { locale, setLocale } = useLocale();
  return (
    <div>
      <div data-testid="current-locale">{locale}</div>
      <div data-testid="translated-text">
        <FormattedMessage id="common.ok" defaultMessage="OK" />
      </div>
      <button onClick={() => setLocale('fr')} data-testid="change-locale">
        Change to French
      </button>
    </div>
  );
};

describe('IntlProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('provides default locale as English', () => {
    render(
      <IntlProvider>
        <TestComponent />
      </IntlProvider>
    );

    expect(screen.getByTestId('current-locale')).toHaveTextContent('en');
    expect(screen.getByTestId('translated-text')).toHaveTextContent('OK');
  });

  it('allows changing locale', async () => {
    render(
      <IntlProvider>
        <TestComponent />
      </IntlProvider>
    );

    await userEvent.click(screen.getByTestId('change-locale'));
    expect(screen.getByTestId('current-locale')).toHaveTextContent('fr');
  });

  it('persists locale in localStorage', async () => {
    render(
      <IntlProvider>
        <TestComponent />
      </IntlProvider>
    );

    await userEvent.click(screen.getByTestId('change-locale'));
    expect(localStorage.getItem('locale')).toBe('fr');

    // Unmount and remount to test persistence
    const { unmount } = render(
      <IntlProvider>
        <TestComponent />
      </IntlProvider>
    );
    unmount();

    render(
      <IntlProvider>
        <TestComponent />
      </IntlProvider>
    );

    expect(screen.getByTestId('current-locale')).toHaveTextContent('fr');
  });

  it('handles localStorage errors gracefully', () => {
    const mockError = new Error('localStorage error');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw mockError;
    });

    render(
      <IntlProvider>
        <TestComponent />
      </IntlProvider>
    );

    expect(screen.getByTestId('current-locale')).toHaveTextContent('en');
    expect(getItemSpy).toHaveBeenCalled();
  });

  it('handles invalid locale in localStorage', () => {
    localStorage.setItem('locale', 'invalid-locale');

    render(
      <IntlProvider>
        <TestComponent />
      </IntlProvider>
    );

    expect(screen.getByTestId('current-locale')).toHaveTextContent('en');
  });
});