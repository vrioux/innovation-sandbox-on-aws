import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { vi } from "vitest";

import { LeaseDurationForm } from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseDurationForm";
import { messages, SupportedLocale } from "@amzn/innovation-sandbox-frontend/i18n/config";

describe("LeaseDurationForm", () => {
  const defaultProps = {
    expirationDate: undefined,
    durationThresholds: [],
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  const renderWithIntl = (ui: React.ReactNode, locale: SupportedLocale = "en") => {
    return render(
      <IntlProvider messages={messages[locale]} locale={locale}>
        {ui}
      </IntlProvider>
    );
  };

  it("renders in English by default", () => {
    renderWithIntl(<LeaseDurationForm {...defaultProps} />);

    expect(screen.getByText("Lease Duration")).toBeInTheDocument();
    expect(screen.getByText("This lease currently does not expire")).toBeInTheDocument();
    expect(screen.getByText("Do not set an expiry date")).toBeInTheDocument();
    expect(screen.getByText("Set an expiry date")).toBeInTheDocument();
  });

  it("renders in French when French locale is used", () => {
    renderWithIntl(<LeaseDurationForm {...defaultProps} />, "fr");

    expect(screen.getByText("Durée de la location")).toBeInTheDocument();
    expect(screen.getByText("Cette location n'expire pas actuellement")).toBeInTheDocument();
    expect(screen.getByText("Ne pas définir de date d'expiration")).toBeInTheDocument();
    expect(screen.getByText("Définir une date d'expiration")).toBeInTheDocument();
  });

  it("shows different text when expiration date is set", () => {
    const props = {
      ...defaultProps,
      expirationDate: "2024-12-31T23:59:59Z",
    };

    renderWithIntl(<LeaseDurationForm {...props} />, "fr");

    expect(screen.getByText("Cette location expire")).toBeInTheDocument();
    expect(screen.getByText("Supprimer la date d'expiration")).toBeInTheDocument();
  });
});