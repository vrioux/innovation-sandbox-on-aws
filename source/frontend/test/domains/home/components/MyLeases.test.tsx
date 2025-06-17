// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { BrowserRouter as Router } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { IntlProvider } from "react-intl";

import { MyLeases } from "@amzn/innovation-sandbox-frontend/domains/home/components/MyLeases";
import { config } from "@amzn/innovation-sandbox-frontend/helpers/config";
import {
  createActiveLease,
  createExpiredLease,
  createPendingLease,
} from "@amzn/innovation-sandbox-frontend/mocks/factories/leaseFactory";
import { mockLeaseApi } from "@amzn/innovation-sandbox-frontend/mocks/mockApi";
import { server } from "@amzn/innovation-sandbox-frontend/mocks/server";
import { renderWithQueryClient } from "@amzn/innovation-sandbox-frontend/setupTests";
import { messages } from "@amzn/innovation-sandbox-frontend/i18n/config";
import moment from "moment";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@amzn/innovation-sandbox-frontend/helpers/AuthService", () => ({
  AuthService: {
    getCurrentUser: vi.fn().mockResolvedValue({ email: "test@example.com" }),
    getAccessToken: vi.fn().mockReturnValue("mocked-access-token"),
  },
}));

// Mock the useGetConfigurations hook
vi.mock("@amzn/innovation-sandbox-frontend/domains/settings/hooks", () => ({
  useGetConfigurations: () => ({
    data: {
      auth: {
        awsAccessPortalUrl: "https://mock-portal-url.com",
      },
    },
    isLoading: false,
    isError: false,
  }),
}));

describe("MyLeases", () => {
  const renderComponent = () =>
    renderWithQueryClient(
      <IntlProvider messages={messages.en} locale="en" defaultLocale="en">
      <Router>
        <MyLeases />
        </Router>
      </IntlProvider>,
    );

  test("renders loading state", async () => {
    renderComponent();
    expect(screen.getByText(messages.en["myLeases.loading"])).toBeInTheDocument();
  });

  test("renders leases with correct count and content", async () => {
    const mockLease1 = createActiveLease({ userEmail: "test@example.com" });
    const mockLease2 = createActiveLease({
      userEmail: "test@example.com",
      status: "Frozen",
    });
    const mockLease3 = createPendingLease({
      userEmail: "test@example.com",
    });
    const mockLease4 = createActiveLease({ userEmail: "other@example.com" }); // This should not be included
    mockLeaseApi.returns([mockLease1, mockLease2, mockLease3, mockLease4]);
    server.use(mockLeaseApi.getHandler());

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(messages.en["myLeases.title"])).toBeInTheDocument();
      expect(screen.getByText("(3)")).toBeInTheDocument();
      expect(
        screen.getByText(mockLease1.originalLeaseTemplateName),
      ).toBeInTheDocument();
      expect(
        screen.getByText(mockLease2.originalLeaseTemplateName),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(mockLease3.originalLeaseTemplateName),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(mockLease4.originalLeaseTemplateName),
      ).not.toBeInTheDocument();
    });
  });

  test("filters out leases that expired over 7 days ago", async () => {
    const mockLease1 = createExpiredLease({
      userEmail: "test@example.com",
      endDate: moment().subtract(6, "days").toISOString(),
    });
    const mockLease2 = createExpiredLease({
      userEmail: "test@example.com",
      endDate: moment().subtract(8, "days").toISOString(),
    });
    mockLeaseApi.returns([mockLease1, mockLease2]);
    server.use(mockLeaseApi.getHandler());

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(messages.en["myLeases.title"])).toBeInTheDocument();
      expect(screen.getByText("(1)")).toBeInTheDocument();
      expect(
        screen.getByText(mockLease1.originalLeaseTemplateName),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(mockLease2.originalLeaseTemplateName),
      ).not.toBeInTheDocument();
    });
  });

  test("renders empty state when no leases are available", async () => {
    mockLeaseApi.returns([]);
    server.use(mockLeaseApi.getHandler());

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(messages.en["myLeases.empty.header"]),
      ).toBeInTheDocument();
      expect(
        screen.getByText(messages.en["myLeases.empty.action"]),
      ).toBeInTheDocument();
    });
  });

  test("handles error state", async () => {
    server.use(
      http.get(`${config.ApiUrl}/leases`, () => {
        return HttpResponse.json(
          { status: "error", message: "Internal Server Error" },
          { status: 500 },
        );
      }),
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(messages.en["myLeases.error.description"]),
      ).toBeInTheDocument();
    });
  });

  test("calls refetch when refresh button is clicked", async () => {
    const mockLease = createActiveLease({ userEmail: "test@example.com" });
    mockLeaseApi.returns([mockLease]);
    server.use(mockLeaseApi.getHandler());

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(messages.en["common.refresh"])).toBeInTheDocument();
      expect(
        screen.getByText(mockLease.originalLeaseTemplateName),
      ).toBeInTheDocument();
    });

    const refreshButton = screen.getByLabelText(messages.en["common.refresh"]);
    await userEvent.click(refreshButton);

    await waitFor(() => {
      expect(
        screen.getByText(mockLease.originalLeaseTemplateName),
      ).toBeInTheDocument();
    });
  });

  test("navigates to request page when 'Request a new lease' is clicked", async () => {
    mockLeaseApi.returns([]);
    server.use(mockLeaseApi.getHandler());

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(messages.en["myLeases.empty.action"]),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(messages.en["myLeases.empty.action"]));

    expect(mockNavigate).toHaveBeenCalledWith("/request");
  });
});
