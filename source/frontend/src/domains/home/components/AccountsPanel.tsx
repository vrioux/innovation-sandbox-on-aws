// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Button, Header, SpaceBetween } from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";

import { AccountsSummary } from "@amzn/innovation-sandbox-frontend/components/AccountsSummary";
import { useGetAccounts } from "@amzn/innovation-sandbox-frontend/domains/accounts/hooks";

export const AccountsPanel = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { data: accounts, isFetching, refetch } = useGetAccounts();

  return (
    <SpaceBetween size="m">
      <Header
        variant="h2"
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <Button
              iconName="refresh"
              ariaLabel={intl.formatMessage({ id: "common.refresh" })}
              disabled={isFetching}
              onClick={() => refetch()}
            />
            <Button onClick={() => navigate("/accounts")}>
              {intl.formatMessage({ id: "manageAccounts.title" })}
            </Button>
          </SpaceBetween>
        }
      >
        {intl.formatMessage({ id: "nav.administration" })}
      </Header>
      <AccountsSummary accounts={accounts} isLoading={isFetching} />
    </SpaceBetween>
  );
};
