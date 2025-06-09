// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, test, vi } from "vitest";
import { TestWrapper } from "../../../TestWrapper";
import { messages, SupportedLocale } from "@amzn/innovation-sandbox-frontend/i18n/config";

import { showErrorToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import { AddLeaseTemplate } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/pages/AddLeaseTemplate";
import { config } from "@amzn/innovation-sandbox-frontend/helpers/config";
import { server } from "@amzn/innovation-sandbox-frontend/mocks/server";
import { renderWithQueryClient } from "@amzn/innovation-sandbox-frontend/setupTests";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@amzn/innovation-sandbox-frontend/components/Toast", () => ({
  showErrorToast: vi.fn(),
}));

describe("NewLeaseTemplate", () => {
  const renderComponent = (locale: SupportedLocale = "en") =>
    renderWithQueryClient(
      <TestWrapper locale={locale}>
        <AddLeaseTemplate />
      </TestWrapper>,
    );

  const fillFormAndNavigate = async (
    user: ReturnType<typeof userEvent.setup>,
    locale: SupportedLocale = "en"
  ) => {
    await waitFor(() => {
      expect(screen.getByLabelText(messages[locale]["leaseTemplates.nameField"])).toBeInTheDocument();
    });

    // Fill out the Basic Details
    await user.type(screen.getByLabelText(messages[locale]["leaseTemplates.nameField"]), "Test Template");
    await user.type(screen.getByLabelText(messages[locale]["leaseTemplates.descriptionField"]), "Test Description");
    await user.click(screen.getByLabelText(messages[locale]["leaseTemplates.approvalRequired"]));

    // Navigate to Budget step
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Filling out Budget details
    await user.type(screen.getByLabelText(messages[locale]["leaseTemplates.maxBudget"]), "1000");

    // Navigate to Duration step
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Filling out Duration details
    await user.type(
      screen.getByLabelText(messages[locale]["leaseTemplates.duration.maxHours"]),
      "24",
    );
  };

  test("renders the form with correct initial values", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(messages.en["leaseTemplates.addNewTitle"])).toBeInTheDocument();
      expect(
        screen.getByText(messages.en["leaseTemplates.addNewDescription"]),
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText(messages.en["leaseTemplates.nameField"])).toBeInTheDocument();
    expect(screen.getByLabelText(messages.en["leaseTemplates.descriptionField"])).toBeInTheDocument();
    expect(screen.getByLabelText(messages.en["leaseTemplates.approvalRequired"])).toBeChecked();
  });

  test("navigates back to lease templates page on cancel", async () => {
    renderComponent();
    const user = userEvent.setup();

    const cancelButton = (
      await screen.findAllByRole("button", { name: messages.en["common.cancel"] })
    )[0];
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith("/lease_templates");
  });

  test("submits form and navigates on successful submission", async () => {
    server.use(
      http.post(`${config.ApiUrl}/leaseTemplates`, () => {
        return HttpResponse.json({ status: "success", data: {} });
      }),
    );

    renderComponent();
    const user = userEvent.setup();

    await fillFormAndNavigate(user);

    // Submit the form
    const submitButton = (
      await screen.findAllByRole("button", { name: messages.en["common.submit"] })
    )[0];
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/lease_templates");
    });
  });

  test("displays error message on submission failure", async () => {
    server.use(
      http.post(`${config.ApiUrl}/leaseTemplates`, () => {
        return HttpResponse.json(
          { status: "error", message: "Failed to create template" },
          { status: 500 },
        );
      }),
    );

    renderComponent();
    const user = userEvent.setup();

    await fillFormAndNavigate(user);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: messages.en["common.submit"] });
    await user.click(submitButton);

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith(
        "HTTP error 500",
        messages.en["error.form.submit"],
      );
    });
  });
});