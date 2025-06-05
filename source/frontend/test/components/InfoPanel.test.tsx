import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { InfoPanel } from "@amzn/innovation-sandbox-frontend/components/InfoPanel";
import userEvent from "@testing-library/user-event";

const messages = {
  "common.ok": "OK",
};

const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <IntlProvider messages={messages} locale="en">
      {ui}
    </IntlProvider>
  );
};

describe("InfoPanel", () => {
  it("displays header", () => {
    const header = "Test Header";
    renderWithIntl(<InfoPanel header={header} />);
    expect(screen.getByText(header)).toBeInTheDocument();
  });

  it("displays description when provided", () => {
    const description = "Test description";
    renderWithIntl(<InfoPanel header="Test" description={description} />);
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it("displays default OK button text when no actionLabel is provided", () => {
    renderWithIntl(<InfoPanel header="Test" action={() => {}} />);
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("displays custom action label when provided", () => {
    const actionLabel = "Custom Action";
    renderWithIntl(<InfoPanel header="Test" action={() => {}} actionLabel={actionLabel} />);
    expect(screen.getByText(actionLabel)).toBeInTheDocument();
  });

  it("calls action when button is clicked", async () => {
    const mockAction = vi.fn();
    renderWithIntl(<InfoPanel header="Test" action={mockAction} />);
    await userEvent.click(screen.getByText("OK"));
    expect(mockAction).toHaveBeenCalled();
  });
});