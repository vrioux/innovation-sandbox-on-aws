// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValuePairs } from "@cloudscape-design/components";
import { FormattedMessage, useIntl } from "react-intl";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SettingsContainer } from "@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";

export const LeaseSettings = () => {
  const {
    data: config,
    isLoading,
    isError: loadingError,
    refetch,
    error,
  } = useGetConfigurations();
  const intl = useIntl();

  if (isLoading) {
    return <Loader />;
  }

  if (loadingError || !config) {
    return (
      <ErrorPanel
        description={intl.formatMessage({ id: "error.loadingSettings" })}
        retry={refetch}
        error={error as Error}
      />
    );
  }

  return (
    <SettingsContainer>
      <KeyValuePairs
        columns={3}
        items={[
          {
            type: "group",
            title: intl.formatMessage({ id: "settings.budget.title" }),
            items: [
              {
                label: <FormattedMessage id="settings.budget.maxBudget" />,
                value: <FormattedMessage 
                  id="settings.budget.maxBudgetValue" 
                  values={{ amount: config.leases.maxBudget }} 
                />,
              },
              {
                label: <FormattedMessage id="settings.budget.requireMax" />,
                value: config.leases.requireMaxBudget.toString(),
              },
            ],
          },
          {
            type: "group",
            title: intl.formatMessage({ id: "settings.duration.title" }),
            items: [
              {
                label: <FormattedMessage id="settings.duration.maxLease" />,
                value: <FormattedMessage 
                  id="settings.duration.maxLeaseValue" 
                  values={{ hours: config.leases.maxDurationHours }} 
                />,
              },
              {
                label: <FormattedMessage id="settings.duration.requireMax" />,
                value: config.leases.requireMaxDuration.toString(),
              },
            ],
          },
          {
            type: "group",
            title: intl.formatMessage({ id: "settings.userLimits.title" }),
            items: [
              {
                label: <FormattedMessage id="settings.userLimits.maxLeases" />,
                value: config.leases.maxLeasesPerUser,
              },
            ],
          },
        ]}
      />
    </SettingsContainer>
  );
};
