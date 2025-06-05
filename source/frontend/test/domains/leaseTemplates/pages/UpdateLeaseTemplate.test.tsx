import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UpdateLeaseTemplate } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/pages/UpdateLeaseTemplate";
import { messages } from "@amzn/innovation-sandbox-frontend/i18n/config";
import { TestWrapper } from "../../../TestWrapper";

describe("UpdateLeaseTemplate", () => {
  it("renders with English translations", () => {
    render(
      <TestWrapper>
        <UpdateLeaseTemplate />
      </TestWrapper>
    );

    // Verify tab labels are translated
    expect(screen.getByText(messages.en["leaseTemplates.basicDetails"])).toBeInTheDocument();
    expect(screen.getByText(messages.en["leaseTemplates.budget"])).toBeInTheDocument();
    expect(screen.getByText(messages.en["leaseTemplates.leaseDuration"])).toBeInTheDocument();

    // Verify alert content is translated
    expect(screen.getByText(messages.en["leaseTemplates.update.note"])).toBeInTheDocument();
    expect(screen.getByText(messages.en["leaseTemplates.update.noteContent"])).toBeInTheDocument();
  });

  it("renders with French translations", () => {
    render(
      <TestWrapper locale="fr">
        <UpdateLeaseTemplate />
      </TestWrapper>
    );

    // Verify tab labels are translated
    expect(screen.getByText(messages.fr["leaseTemplates.basicDetails"])).toBeInTheDocument();
    expect(screen.getByText(messages.fr["leaseTemplates.budget"])).toBeInTheDocument();
    expect(screen.getByText(messages.fr["leaseTemplates.leaseDuration"])).toBeInTheDocument();

    // Verify alert content is translated
    expect(screen.getByText(messages.fr["leaseTemplates.update.note"])).toBeInTheDocument();
    expect(screen.getByText(messages.fr["leaseTemplates.update.noteContent"])).toBeInTheDocument();
  });
});