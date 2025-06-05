// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { IntlProvider } from "react-intl";

import {
  testErrorState,
  testLoadingState,
  testRefetchOnError,
} from "@amzn/innovation-sandbox-frontend-test/utils/settingsTestUtils";
import { Settings } from "@amzn/innovation-sandbox-frontend/domains/settings/pages/Settings";
import { renderWithQueryClient } from "@amzn/innovation-sandbox-frontend/setupTests";
import { messages } from "@amzn/innovation-sandbox-frontend/i18n/config";

const mockSetBreadcrumb = vi.fn();

vi.mock("@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb", () => ({
  useBreadcrumb: () => mockSetBreadcrumb,
}));

describe("Settings", () => {
  const renderComponent = () =>
    renderWithQueryClient(
      <IntlProvider messages={messages.en} locale="en">
        <Router>
          <Settings />
        </Router>
      </IntlProvider>,
    );

  test("renders Settings page correctly", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(messages.en["settings.title"])).toBeInTheDocument();
      expect(
        screen.getByText(messages.en["settings.description"]),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("tab", { name: messages.en["settings.general"] }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: messages.en["settings.lease"] }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: messages.en["settings.cleanup"] }),
    ).toBeInTheDocument();
  });

  test("sets breadcrumb correctly", () => {
    renderComponent();

    expect(mockSetBreadcrumb).toHaveBeenCalledWith([
      { text: messages.en["common.home"], href: "/" },
      { text: messages.en["settings.title"], href: "/settings" },
    ]);
  });

  test("switches between tabs", async () => {
    renderComponent();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: messages.en["settings.general"] }),
      ).toBeInTheDocument();
    });

    // Check if General Settings tab is active by default
    expect(
      screen.getByRole("tab", { name: messages.en["settings.general"], selected: true }),
    ).toBeInTheDocument();

    // Switch to Lease Settings tab
    await user.click(screen.getByRole("tab", { name: messages.en["settings.lease"] }));
    expect(
      screen.getByRole("tab", { name: messages.en["settings.lease"], selected: true }),
    ).toBeInTheDocument();

    // Switch to Clean Up Settings tab
    await user.click(screen.getByRole("tab", { name: messages.en["settings.cleanup"] }));
    expect(
      screen.getByRole("tab", { name: messages.en["settings.cleanup"], selected: true }),
    ).toBeInTheDocument();
  });

  test("handles loading state", async () => {
    await testLoadingState(renderComponent);
  });

  test("handles error state", async () => {
    await testErrorState(renderComponent);
  });

  test("refetches data on error retry", async () => {
    await testRefetchOnError(renderComponent);
  });
});
