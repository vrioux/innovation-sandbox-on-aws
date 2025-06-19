// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValuePairs } from "@cloudscape-design/components";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/hooks/useTranslation";

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
  const { t } = useTranslation();

  if (isLoading) {
    return <Loader />;
  }

  if (loadingError || !config) {
    return (
      <ErrorPanel
        description={t("error.loadingSettings")}
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
            title: t("settings.budget.title"),
            items: [
              {
                label: t("settings.budget.maxBudget"),
                value: t("settings.budget.maxBudgetValue", undefined, { amount: config.leases.maxBudget }),
              },
              {
                label: t("settings.budget.requireMax"),
                value: config.leases.requireMaxBudget.toString(),
              },
            ],
          },
          {
            type: "group",
            title: t("settings.duration.title"),
            items: [
              {
                label: t("settings.duration.maxLease"),
                value: t("settings.duration.maxLeaseValue", undefined, { hours: config.leases.maxDurationHours }),
              },
              {
                label: t("settings.duration.requireMax"),
                value: config.leases.requireMaxDuration.toString(),
              },
            ],
          },
          {
            type: "group",
            title: t("settings.userLimits.title"),
            items: [
              {
                label: t("settings.userLimits.maxLeases"),
                value: config.leases.maxLeasesPerUser,
              },
            ],
          },
        ]}
      />
    </SettingsContainer>
  );
};