import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { BrowserRouter } from "react-router-dom";

const messages = {
  "error.defaultHeader": "Whoops, something went wrong.",
  "error.sessionExpired": "Session expired",
  "error.loginAgain": "Login Again",
  "error.tryAgain": "Try again",
};

const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <IntlProvider messages={messages} locale="en">
      <BrowserRouter>{ui}</BrowserRouter>
    </IntlProvider>
  );
};

describe("ErrorPanel", () => {
  it("displays default error message when no header is provided", () => {
    renderWithIntl(<ErrorPanel />);
    expect(screen.getByText("Whoops, something went wrong.")).toBeInTheDocument();
  });

  it("displays custom header when provided", () => {
    const customHeader = "Custom Error";
    renderWithIntl(<ErrorPanel header={customHeader} />);
    expect(screen.getByText(customHeader)).toBeInTheDocument();
  });

  it("displays session expired message for 403 errors", () => {
    renderWithIntl(<ErrorPanel error={new Error("403 Forbidden")} />);
    expect(screen.getByText("Session expired")).toBeInTheDocument();
    expect(screen.getByText("Login Again")).toBeInTheDocument();
  });

  it("displays retry button when retry function is provided", () => {
    const mockRetry = vi.fn();
    renderWithIntl(<ErrorPanel retry={mockRetry} />);
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("displays description when provided", () => {
    const description = "Test error description";
    renderWithIntl(<ErrorPanel description={description} />);
    expect(screen.getByText(description)).toBeInTheDocument();
  });
});