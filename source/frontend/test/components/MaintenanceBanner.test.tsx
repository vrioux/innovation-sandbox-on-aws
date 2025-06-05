import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { MaintenanceBanner } from "@amzn/innovation-sandbox-frontend/components/MaintenanceBanner";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";

vi.mock("@amzn/innovation-sandbox-frontend/domains/settings/hooks", () => ({
  useGetConfigurations: vi.fn(),
}));

const messages = {
  "maintenance.header": "Maintenance Mode",
  "maintenance.message": "Innovation Sandbox on AWS is currently in maintenance mode. Access to the web application is limited to admin users. To disable maintenance mode, admins need to go to",
  "maintenance.appConfigLink": "AWS AppConfig",
};

const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <IntlProvider messages={messages} locale="en">
      {ui}
    </IntlProvider>
  );
};

describe("MaintenanceBanner", () => {
  it("displays maintenance banner when maintenance mode is enabled", () => {
    (useGetConfigurations as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { maintenanceMode: true },
    });

    renderWithIntl(<MaintenanceBanner />);
    expect(screen.getByText("Maintenance Mode")).toBeInTheDocument();
    expect(screen.getByText(/Innovation Sandbox on AWS is currently in maintenance mode/)).toBeInTheDocument();
    expect(screen.getByText("AWS AppConfig")).toBeInTheDocument();
  });

  it("does not display maintenance banner when maintenance mode is disabled", () => {
    (useGetConfigurations as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { maintenanceMode: false },
    });

    renderWithIntl(<MaintenanceBanner />);
    expect(screen.queryByText("Maintenance Mode")).not.toBeInTheDocument();
  });

  it("does not display maintenance banner when configuration is not loaded", () => {
    (useGetConfigurations as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
    });

    renderWithIntl(<MaintenanceBanner />);
    expect(screen.queryByText("Maintenance Mode")).not.toBeInTheDocument();
  });
});