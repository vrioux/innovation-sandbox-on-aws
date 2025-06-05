import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { FullPageLoader } from "@amzn/innovation-sandbox-frontend/components/FullPageLoader";

const messages = {
  "common.loading": "Loading...",
};

const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <IntlProvider messages={messages} locale="en">
      {ui}
    </IntlProvider>
  );
};

describe("FullPageLoader", () => {
  it("displays default loading message when no label is provided", () => {
    renderWithIntl(<FullPageLoader />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays custom label when provided", () => {
    const customLabel = "Custom Loading Message";
    renderWithIntl(<FullPageLoader label={customLabel} />);
    expect(screen.getByText(customLabel)).toBeInTheDocument();
  });
});