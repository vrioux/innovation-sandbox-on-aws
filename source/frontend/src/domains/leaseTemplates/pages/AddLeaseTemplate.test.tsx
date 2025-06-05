// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AddLeaseTemplate } from "./AddLeaseTemplate";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/hooks/useTranslation";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";

// Mock the hooks
vi.mock("@amzn/innovation-sandbox-frontend/hooks/useTranslation", () => ({
  useTranslation: vi.fn(),
}));

vi.mock("@amzn/innovation-sandbox-frontend/domains/settings/hooks", () => ({
  useGetConfigurations: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("AddLeaseTemplate", () => {
  beforeEach(() => {
    (useTranslation as any).mockReturnValue({
      t: (_key: string, defaultMessage: string) => defaultMessage,
    });

    (useGetConfigurations as any).mockReturnValue({
      data: {
        leases: {
          maxBudget: 1000,
          maxDurationHours: 24,
        },
      },
      isLoading: false,
      isError: false,
    });
  });

  it("renders with proper translations", () => {
    render(<AddLeaseTemplate />);

    // Check if main title is rendered
    expect(screen.getByText("Add a New Lease Template")).toBeInTheDocument();

    // Check if description is rendered
    expect(
      screen.getByText("Give your users a new way to access a temporary AWS account.")
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    (useGetConfigurations as any).mockReturnValue({
      isLoading: true,
    });

    render(<AddLeaseTemplate />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows error state", () => {
    (useGetConfigurations as any).mockReturnValue({
      isError: true,
      error: new Error("Test error"),
    });

    render(<AddLeaseTemplate />);
    expect(
      screen.getByText("There was a problem loading global configuration settings.")
    ).toBeInTheDocument();
  });
});