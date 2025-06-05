// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SideNavigationProps } from "@cloudscape-design/components";
import { useIntl } from "react-intl";

import { ApprovalsBadge } from "@amzn/innovation-sandbox-frontend/domains/leases/components/ApprovalsBadge";

export const useNavigationItems = () => {
  const intl = useIntl();
  const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage });

  const commonNavItems: SideNavigationProps.Item[] = [
    { type: "divider" },
    {
      external: true,
      href: "https://docs.aws.amazon.com/solutions/latest/innovation-sandbox-on-aws/use-the-solution.html",
      text: t("nav.documentation", "Documentation"),
      type: "link",
    },
  ];

  const userNavItems: SideNavigationProps.Item[] = [
    { href: "/", text: t("nav.home", "Home"), type: "link" },
  ];

  const managerNavItems: SideNavigationProps.Item[] = [
    ...userNavItems,
    { type: "divider" },
    {
      href: "/approvals",
      text: t("nav.approvals", "Approvals"),
      type: "link",
      info: <ApprovalsBadge />,
    },
    { href: "/leases", text: t("nav.leases", "Leases"), type: "link" },
    { href: "/lease_templates", text: t("nav.leaseTemplates", "Lease Templates"), type: "link" },
  ];

  const adminNavItems: SideNavigationProps.Item[] = [
    ...managerNavItems,
    { type: "divider" },
    {
      type: "section",
      text: t("nav.administration", "Administration"),
      items: [
        { href: "/accounts", text: t("nav.accounts", "Accounts"), type: "link" },
        { href: "/settings", text: t("nav.settings", "Settings"), type: "link" },
      ],
    },
  ];

  return {
    commonNavItems,
    userNavItems,
    managerNavItems,
    adminNavItems,
  };
};

export const spacerSvg = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  ></svg>
);