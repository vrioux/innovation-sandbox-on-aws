// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { config } from "@amzn/innovation-sandbox-frontend/helpers/config";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { BrowserRouter as Router } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import {
  GlobalConfigForUI,
  GlobalConfigForUISchema,
} from "@amzn/innovation-sandbox-commons/data/global-config/global-config";
import { generateSchemaData } from "@amzn/innovation-sandbox-commons/test/generate-schema-data";
import { BaseLayout } from "@amzn/innovation-sandbox-frontend/components/AppLayout/BaseLayout";
import { server } from "@amzn/innovation-sandbox-frontend/mocks/server";
import { renderWithQueryClient } from "@amzn/innovation-sandbox-frontend/setupTests";
import { ApiResponse } from "@amzn/innovation-sandbox-frontend/types";
import { IntlProvider } from "@amzn/innovation-sandbox-frontend/i18n/IntlProvider";

vi.mock("@amzn/innovation-sandbox-frontend/helpers/AuthService", () => ({
  AuthService: {
    getCurrentUser: vi.fn().mockResolvedValue({ email: "test@example.com" }),
    getAccessToken: vi.fn().mockReturnValue("mocked-access-token"),
  },
}));

describe("BaseLayout", () => {
  const renderComponent = () =>
    renderWithQueryClient(
      <Router>
        <IntlProvider>
          <BaseLayout>
            <div data-testid="child-content">Child Content</div>
          </BaseLayout>
        </IntlProvider>
      </Router>,
    );

  test("does not render maintenance banner when maintenance mode is disabled", () => {
    server.use(
      http.get(`${config.ApiUrl}/configurations`, () => {
        return HttpResponse.json({
          status: "success",
          data: generateSchemaData(GlobalConfigForUISchema, {
            maintenanceMode: false,
          }),
        } as ApiResponse<GlobalConfigForUI>);
      }),
    );

    renderComponent();

    expect(screen.queryByText("Maintenance Mode")).not.toBeInTheDocument();
  });

  test("renders maintenance banner when maintenance mode is enabled", async () => {
    server.use(
      http.get(`${config.ApiUrl}/configurations`, () => {
        return HttpResponse.json({
          status: "success",
          data: generateSchemaData(GlobalConfigForUISchema, {
            maintenanceMode: true,
          }),
        } as ApiResponse<GlobalConfigForUI>);
      }),
    );

    renderComponent();

    expect(await screen.findByText("Maintenance Mode")).toBeInTheDocument();
  });

  test("navigation items update when language changes", async () => {
    const { container } = renderComponent();
    
    // Wait for initial render with English text
    await waitFor(() => {
      expect(screen.getByText("Documentation")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    // Get the language selector and change to French
    const languageSelect = container.querySelector('select[aria-label="Select language"]');
    expect(languageSelect).toBeInTheDocument();
    
    if (languageSelect) {
      // Simulate language change to French
      fireEvent.change(languageSelect, { target: { value: 'fr' } });

      // Wait for navigation items to update with French text
      await waitFor(() => {
        expect(screen.getByText("Documentation")).toBeInTheDocument(); // "Documentation" is same in French
        expect(screen.getByText("Accueil")).toBeInTheDocument(); // "Home" in French
      });
    }
  });
});