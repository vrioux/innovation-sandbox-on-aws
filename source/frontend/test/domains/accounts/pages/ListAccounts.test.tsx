// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { IntlProvider } from "react-intl";
import { BrowserRouter as Router } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import { SandboxAccount } from "@amzn/innovation-sandbox-commons/data/sandbox-account/sandbox-account.js";
import { ListAccounts } from "@amzn/innovation-sandbox-frontend/domains/accounts/pages/ListAccounts";
import { config } from "@amzn/innovation-sandbox-frontend/helpers/config";
import { ModalProvider } from "@amzn/innovation-sandbox-frontend/hooks/useModal";
import { mockAccounts } from "@amzn/innovation-sandbox-frontend/mocks/handlers/accountHandlers";
import { server } from "@amzn/innovation-sandbox-frontend/mocks/server";
import { renderWithQueryClient } from "@amzn/innovation-sandbox-frontend/setupTests";
import {
  ApiPaginatedResult,
  ApiResponse,
} from "@amzn/innovation-sandbox-frontend/types";
import { messages } from "@amzn/innovation-sandbox-frontend/i18n/config";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

const mockNavigate = vi.fn();
const mockSetBreadcrumb = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb", () => ({
  useBreadcrumb: () => mockSetBreadcrumb,
}));

describe("ListAccounts", () => {
  const renderComponent = () =>
    renderWithQueryClient(
      <IntlProvider messages={messages.en} locale="en">
        <ModalProvider>
          <Router>
            <ListAccounts />
          </Router>
        </ModalProvider>
      </IntlProvider>,
    );

  test("renders the component with correct structure", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: messages.en["accounts.title"], level: 1 }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(messages.en["accounts.description"]),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: messages.en["accounts.addButton"] }),
      ).toBeInTheDocument();
    });

    expect(
      await screen.findByText(mockAccounts[0].awsAccountId),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(mockAccounts[1].awsAccountId),
    ).toBeInTheDocument();
  });

  test("navigates to add accounts page when 'Add accounts' button is clicked", async () => {
    renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: messages.en["accounts.addButton"] }));

    expect(mockNavigate).toHaveBeenCalledWith("/accounts/new");
  });

  test("sets breadcrumb correctly", async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockSetBreadcrumb).toHaveBeenCalledWith([
        { text: messages.en["common.home"], href: "/" },
        { text: messages.en["accounts.title"], href: "/accounts" },
      ]);
    });
  });

  test("displays loading state while fetching accounts", async () => {
    server.use(
      http.get(`${config.ApiUrl}/accounts`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          status: "success",
          data: {
            result: mockAccounts,
            nextPageIdentifier: null,
          },
        } as ApiResponse<ApiPaginatedResult<SandboxAccount>>);
      }),
    );

    renderComponent();

    expect(screen.getByText("Loading account info...")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByText("Loading account info..."),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(mockAccounts[0].awsAccountId),
      ).toBeInTheDocument();
    });
  });

  test("allows selecting accounts and enables action buttons", async () => {
    renderComponent();
    const user = userEvent.setup();

    await screen.findByText(mockAccounts[0].awsAccountId);

    const checkbox = screen.getAllByRole("checkbox")[1];
    await user.click(checkbox);

    expect(screen.getByText(messages.en["accounts.actions"])).not.toBeDisabled();
  });

  test("refreshes account data when refresh button is clicked", async () => {
    let requestCount = 0;
    server.use(
      http.get(`${config.ApiUrl}/accounts`, () => {
        requestCount++;
        return HttpResponse.json({
          status: "success",
          data: {
            result: requestCount === 1 ? mockAccounts : [mockAccounts[0]],
            nextPageIdentifier: null,
          },
        } as ApiResponse<ApiPaginatedResult<SandboxAccount>>);
      }),
    );

    renderComponent();
    const user = userEvent.setup();

    await screen.findByText(mockAccounts[0].awsAccountId);
    await screen.findByText(mockAccounts[1].awsAccountId);

    const refreshButton = screen.getByTestId("refresh-button");
    expect(refreshButton).not.toBeDisabled();
    await user.click(refreshButton);

    await waitFor(() => {
      expect(
        screen.getByText(mockAccounts[0].awsAccountId),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(mockAccounts[1].awsAccountId),
      ).not.toBeInTheDocument();
    });
  });

  test("filters accounts based on status", async () => {
    const user = userEvent.setup();
    renderComponent();

    await screen.findByText(mockAccounts[0].awsAccountId);
    await screen.findByText(mockAccounts[1].awsAccountId);
    const filterInput = screen.getByPlaceholderText("Search");

    await user.type(filterInput, "Available");
    await waitFor(() => {
      expect(
        screen.getByText(mockAccounts[0].awsAccountId),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(mockAccounts[1].awsAccountId),
      ).not.toBeInTheDocument();
    });

    await user.clear(filterInput);

    await waitFor(() => {
      expect(
        screen.getByText(mockAccounts[0].awsAccountId),
      ).toBeInTheDocument();
      expect(
        screen.getByText(mockAccounts[1].awsAccountId),
      ).toBeInTheDocument();
    });
  });

  test("enables action buttons when accounts are selected", async () => {
    renderComponent();
    await screen.findByText(mockAccounts[0].awsAccountId);

    const checkbox = screen.getAllByRole("checkbox")[1];
    userEvent.click(checkbox);

    expect(screen.getByText(messages.en["accounts.actions"])).not.toBeDisabled();
  });

  test("opens eject modal when 'Eject account' is selected", async () => {
    renderComponent();
    const user = userEvent.setup();

    const account = mockAccounts.find(
      (account) => account.status === "Available",
    );

    await screen.findByText(account!.awsAccountId);

    const row = screen.getByText(account!.awsAccountId).closest("tr");
    const checkbox = within(row!).getByRole("checkbox");
    await user.click(checkbox);

    const actionsButton = screen.getByText(messages.en["accounts.actions"]);
    await user.click(actionsButton);

    const ejectOption = await screen.findByText(messages.en["accounts.actions.eject"]);
    await user.click(ejectOption);

    const modal = screen.getByRole("dialog");
    await waitFor(() => {
      expect(modal).toBeInTheDocument();
    });

    const modalContent = within(modal);

    expect(modalContent.getByText("1 account(s) to eject")).toBeInTheDocument();

    await waitFor(() =>
      expect(modalContent.getByText(account!.awsAccountId)).toBeInTheDocument(),
    );
  });

  test("disables 'Retry cleanup' when a non-quarantine account is selected", async () => {
    renderComponent();
    const user = userEvent.setup();

    await screen.findByRole("table");

    // Available cannot attempt retry cleanup
    const filteredAccounts = mockAccounts.filter(
      (account) =>
        account.status === "Available" || account.status === "CleanUp",
    );

    for (const account of filteredAccounts) {
      await screen.findByText(account.awsAccountId);
      const row = screen.getByText(account.awsAccountId).closest("tr");
      const checkbox = within(row!).getByRole("checkbox");
      await user.click(checkbox);
    }

    const actionsButton = screen.getByText(messages.en["accounts.actions"]);
    await user.click(actionsButton);

    const cleanupOption = await screen.findByText(messages.en["accounts.actions.retryCleanup"]);
    await user.click(cleanupOption);

    // option should be disabled
    expect(cleanupOption).toHaveAttribute("aria-disabled", "true");
  });

  test("opens cleanup modal when 'Retry cleanup' is selected", async () => {
    renderComponent();
    const user = userEvent.setup();

    await screen.findByRole("table");

    // Both Quarantine and CleanUp can attempt retry cleanup
    const filteredAccounts = mockAccounts.filter(
      (account) =>
        account.status === "Quarantine" || account.status === "CleanUp",
    );

    for (const account of filteredAccounts) {
      await screen.findByText(account.awsAccountId);
      const row = screen.getByText(account.awsAccountId).closest("tr");
      const checkbox = within(row!).getByRole("checkbox");
      await user.click(checkbox);
    }

    const actionsButton = screen.getByText(messages.en["accounts.actions"]);
    await user.click(actionsButton);

    const cleanupOption = await screen.findByText(messages.en["accounts.actions.retryCleanup"]);
    await user.click(cleanupOption);

    const modal = screen.getByRole("dialog");
    await waitFor(() => {
      expect(modal).toBeInTheDocument();
    });

    const modalContent = within(modal);

    expect(
      modalContent.getByText(
        `${filteredAccounts.length} account(s) to retry cleanup`,
      ),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(
        modalContent.getByText(filteredAccounts[0].awsAccountId),
      ).toBeInTheDocument(),
    );
  });

  test("displays login link for accounts", async () => {
    renderComponent();

    await screen.findByText(mockAccounts[0].awsAccountId);

    const loginLinks = screen.getAllByText("Login to account");
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  test("updates account status indicators correctly", async () => {
    renderComponent();

    await screen.findByText(mockAccounts[0].awsAccountId);

    // Find all status indicators
    const statusIndicators = screen.getAllByText(/Available|Active/);

    // Check if both statuses are present
    expect(
      statusIndicators.some((element) => element.textContent === "Available"),
    ).toBe(true);
    expect(
      statusIndicators.some((element) => element.textContent === "Active"),
    ).toBe(true);
  });
});
