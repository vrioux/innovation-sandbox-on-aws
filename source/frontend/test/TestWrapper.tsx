import { IntlProvider } from "react-intl";
import { BrowserRouter } from "react-router-dom";
import { messages, SupportedLocale } from "@amzn/innovation-sandbox-frontend/i18n/config";

interface TestWrapperProps {
  children: React.ReactNode;
  locale?: SupportedLocale;
}

export function TestWrapper({ children, locale = "en" }: TestWrapperProps) {
  return (
    <IntlProvider messages={messages[locale]} locale={locale} defaultLocale="en">
      <BrowserRouter>{children}</BrowserRouter>
    </IntlProvider>
  );
}