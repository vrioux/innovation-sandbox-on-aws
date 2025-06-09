import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { LanguageSelector } from '../../../src/components/LanguageSelector';
import { messages } from '../../../src/i18n/config';

describe('LanguageSelector', () => {
  it('renders all supported languages', () => {
    render(
      <IntlProvider messages={messages.en} locale="en">
        <LanguageSelector />
      </IntlProvider>
    );

    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    // Check if all language options are present
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Português')).toBeInTheDocument();
    expect(screen.getByText('Italiano')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
  });

  it('changes language when a new option is selected', () => {
    const mockSetLocale = vi.fn();
    const mockUseLocale = () => ({ locale: 'en', setLocale: mockSetLocale });
    vi.mock('../../../src/i18n/IntlProvider', () => ({
      useLocale: mockUseLocale,
    }));

    render(
      <IntlProvider messages={messages.en} locale="en">
        <LanguageSelector />
      </IntlProvider>
    );

    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    // Select Spanish
    fireEvent.click(screen.getByText('Español'));

    // Verify that setLocale was called with 'es'
    expect(mockSetLocale).toHaveBeenCalledWith('es');
  });
});