// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UseQueryResult } from "@tanstack/react-query";
import { useIntl } from "react-intl";

import {
  Lease,
  LeaseStatus,
} from "@amzn/innovation-sandbox-commons/data/lease/lease";

// helper function to turn labels like "PendingApproval" into "Pending Approval"
const splitCamelCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
};

// Non-hook version that returns default English strings
export const getLeaseStatusDisplayName = (status: LeaseStatus): string => {
  switch (status) {
    case "Active":
      return "Active";
    case "Frozen":
      return "Frozen - Threshold Reached";
    case "PendingApproval":
      return "Pending Approval";
    case "ApprovalDenied":
      return "Approval Denied";
    case "Expired":
      return "Lease Duration Expired";
    case "BudgetExceeded":
      return "Budget Exceeded";
    case "ManuallyTerminated":
      return "Lease Manually Terminated";
    case "AccountQuarantined":
      return "Account Quarantined";
    case "Ejected":
      return "Account Manually Ejected";
    default:
      return splitCamelCase(status);
  }
};

// Hook version that provides internationalization
export const useLeaseStatusDisplayName = () => {
  const intl = useIntl();
  
  return (status: LeaseStatus): string => {
    switch (status) {
      case "Active":
        return intl.formatMessage({ id: "status.active", defaultMessage: "Active" });
      case "Frozen":
        return intl.formatMessage({ id: "status.frozen", defaultMessage: "Frozen - Threshold Reached" });
      case "PendingApproval":
        return intl.formatMessage({ id: "status.pendingApproval", defaultMessage: "Pending Approval" });
      case "ApprovalDenied":
        return intl.formatMessage({ id: "status.approvalDenied", defaultMessage: "Approval Denied" });
      case "Expired":
        return intl.formatMessage({ id: "status.expired", defaultMessage: "Lease Duration Expired" });
      case "BudgetExceeded":
        return intl.formatMessage({ id: "status.budgetExceeded", defaultMessage: "Budget Exceeded" });
      case "ManuallyTerminated":
        return intl.formatMessage({ id: "status.manuallyTerminated", defaultMessage: "Lease Manually Terminated" });
      case "AccountQuarantined":
        return intl.formatMessage({ id: "status.accountQuarantined", defaultMessage: "Account Quarantined" });
      case "Ejected":
        return intl.formatMessage({ id: "status.ejected", defaultMessage: "Account Manually Ejected" });
      default:
        return splitCamelCase(status);
    }
  };
};

export const generateBreadcrumb = (
  query: UseQueryResult<Lease | undefined, unknown>,
  isApprovalPage?: boolean,
) => {
  const intl = useIntl();
  const { data: lease, isLoading, isError } = query;

  const breadcrumbItems = [{ text: intl.formatMessage({ id: "common.home", defaultMessage: "Home" }), href: "/" }];

  if (isApprovalPage) {
    breadcrumbItems.push({ text: intl.formatMessage({ id: "approvals.title", defaultMessage: "Approvals" }), href: "/approvals" });
  } else {
    breadcrumbItems.push({ text: intl.formatMessage({ id: "leases.title", defaultMessage: "Leases" }), href: "/leases" });
  }

  if (isLoading) {
    breadcrumbItems.push({ text: intl.formatMessage({ id: "common.loading", defaultMessage: "Loading..." }), href: "#" });
    return breadcrumbItems;
  }

  if (isError || !lease) {
    breadcrumbItems.push({ text: intl.formatMessage({ id: "common.error", defaultMessage: "Error" }), href: "#" });
    return breadcrumbItems;
  }

  breadcrumbItems.push({
    text: lease.owner.type === 'user' ? lease.owner.userEmail : `Team ${lease.owner.teamId}`,
    href: "#",
  });

  return breadcrumbItems;
};

export const leaseStatusSortingComparator = (a: Lease, b: Lease): number => {
  const statusOrder = {
    PendingApproval: 1,
    Frozen: 2,
    Active: 3,
    Expired: 4,
    BudgetExceeded: 5,
    AccountQuarantined: 6,
    ManuallyTerminated: 7,
    Ejected: 8,
    ApprovalDenied: 9,
  };

  const statusA = statusOrder[a.status] || Number.MAX_VALUE;
  const statusB = statusOrder[b.status] || Number.MAX_VALUE;

  return statusA - statusB;
};
