// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { BrowserRouter as Router } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "@amzn/innovation-sandbox-frontend/i18n";

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
  const renderComponent = () =>
    renderWithQueryClient(
      <I18nextProvider i18n={i18n}>
        <Router>
          <AddLeaseTemplate />
        </Router>
      </I18nextProvider>,
    );

  const fillFormAndNavigate = async (
    user: ReturnType<typeof userEvent.setup>,
  ) => {
    await waitFor(() => {
      expect(screen.getByLabelText(i18n.t("leaseTemplates.nameField"))).toBeInTheDocument();
    });

    // Fill out the Basic Details
    await user.type(screen.getByLabelText(i18n.t("leaseTemplates.nameField")), "Test Template");
    await user.type(screen.getByLabelText(i18n.t("leaseTemplates.descriptionField")), "Test Description");
    await user.click(screen.getByLabelText(i18n.t("leaseTemplates.approvalRequired")));

    // Navigate to Budget step
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Filling out Budget details
    await user.type(screen.getByLabelText(i18n.t("leaseTemplates.budget.maxAmount")), "1000");

    // Navigate to Duration step
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Filling out Duration details
    await user.type(
      screen.getByLabelText(i18n.t("leaseTemplates.duration.maxHours")),
      "24",
    );
  };

  test("renders the form with correct initial values", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(i18n.t("leaseTemplates.addNewTitle"))).toBeInTheDocument();
      expect(
        screen.getByText(i18n.t("leaseTemplates.addNewDescription")),
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText(i18n.t("leaseTemplates.nameField"))).toBeInTheDocument();
    expect(screen.getByLabelText(i18n.t("leaseTemplates.descriptionField"))).toBeInTheDocument();
    expect(screen.getByLabelText(i18n.t("leaseTemplates.approvalRequired"))).toBeChecked();
  });

  test("navigates back to lease templates page on cancel", async () => {
    renderComponent();
    const user = userEvent.setup();

    const cancelButton = (
      await screen.findAllByRole("button", { name: i18n.t("common.cancel") })
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
      await screen.findAllByRole("button", { name: i18n.t("common.submit") })
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
    const submitButton = screen.getByRole("button", { name: i18n.t("common.submit") });
    await user.click(submitButton);

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith(
        "HTTP error 500",
        i18n.t("error.form.submit"),
      );
    });
  });
});
