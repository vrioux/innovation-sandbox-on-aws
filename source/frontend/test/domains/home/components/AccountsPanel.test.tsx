// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { BrowserRouter as Router } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { IntlProvider } from "react-intl";

import { AccountsPanel } from "@amzn/innovation-sandbox-frontend/domains/home/components/AccountsPanel";
import { config } from "@amzn/innovation-sandbox-frontend/helpers/config";
import { createSandboxAccount } from "@amzn/innovation-sandbox-frontend/mocks/factories/accountFactory";
import { mockAccountApi } from "@amzn/innovation-sandbox-frontend/mocks/mockApi";
import { server } from "@amzn/innovation-sandbox-frontend/mocks/server";
import { renderWithQueryClient } from "@amzn/innovation-sandbox-frontend/setupTests";
import { messages } from "@amzn/innovation-sandbox-frontend/i18n/config";

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

describe("AccountsPanel", () => {
  const renderComponent = () =>
    renderWithQueryClient(
      <IntlProvider messages={messages.en} locale="en" defaultLocale="en">
        <Router>
          <AccountsPanel />
        </Router>
      </IntlProvider>,
    );

  test("renders the header and manage accounts button", async () => {
    renderComponent();

    expect(screen.getByText(messages.en["nav.administration"])).toBeInTheDocument();
    expect(screen.getByText(messages.en["manageAccounts.title"])).toBeInTheDocument();
  });

  test("displays loading state while fetching accounts", async () => {
    server.use(
      http.get(`${config.ApiUrl}/accounts`, () => {
        return new Promise((resolve) =>
          setTimeout(() => resolve(HttpResponse.json([])), 100),
        );
      }),
    );

    renderComponent();

    expect(screen.getByText("Loading account info...")).toBeInTheDocument();
  });

  test("displays accounts summary when accounts are fetched", async () => {
    const mockAccounts = [
      createSandboxAccount({ status: "Available" }),
      createSandboxAccount({ status: "Active" }),
      createSandboxAccount({ status: "Frozen" }),
      createSandboxAccount({ status: "CleanUp" }),
      createSandboxAccount({ status: "Quarantine" }),
    ];
    mockAccountApi.returns(mockAccounts);
    server.use(mockAccountApi.getHandler());

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Administration")).toBeInTheDocument();
      screen
        .getAllByText("Available")
        .forEach((element) => expect(element).toBeInTheDocument);
      expect(screen.getAllByText("Available")).toHaveLength(3);
      screen
        .getAllByText("Active")
        .forEach((element) => expect(element).toBeInTheDocument);
      expect(screen.getAllByText("Active")).toHaveLength(3);
      screen
        .getAllByText("Frozen")
        .forEach((element) => expect(element).toBeInTheDocument);
      expect(screen.getAllByText("Frozen")).toHaveLength(3);
      screen
        .getAllByText("Clean Up")
        .forEach((element) => expect(element).toBeInTheDocument);
      expect(screen.getAllByText("Clean Up")).toHaveLength(3);
      screen
        .getAllByText("Quarantine")
        .forEach((element) => expect(element).toBeInTheDocument);
      expect(screen.getAllByText("Quarantine")).toHaveLength(3);
    });
  });

  test("displays no accounts message when there are no accounts", async () => {
    mockAccountApi.returns([]);
    server.use(mockAccountApi.getHandler());

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(messages.en["accounts.noAccounts"]),
      ).toBeInTheDocument();
      expect(screen.getByText(messages.en["accounts.addButton"])).toBeInTheDocument();
    });
  });

  test("navigates to accounts page when manage accounts button is clicked", async () => {
    renderComponent();

    const manageAccountsButton = screen.getByText(messages.en["manageAccounts.title"]);
    await userEvent.click(manageAccountsButton);

    expect(mockNavigate).toHaveBeenCalledWith("/accounts");
  });

  test("navigates to add accounts page when there are no accounts", async () => {
    mockAccountApi.returns([]);
    server.use(mockAccountApi.getHandler());

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(messages.en["accounts.addButton"])).toBeInTheDocument();
    });

    const addAccountsButton = screen.getByText(messages.en["accounts.addButton"]);
    await userEvent.click(addAccountsButton);

    expect(mockNavigate).toHaveBeenCalledWith("/accounts/new");
  });

  test("handles error state", async () => {
    server.use(
      http.get(`${config.ApiUrl}/accounts`, () => {
        return HttpResponse.json(
          { status: "error", message: "Internal Server Error" },
          { status: 500 },
        );
      }),
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(messages.en["accounts.noAccounts"]),
      ).toBeInTheDocument();
    });
  });
});
