// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Container,
  KeyValuePairs,
  StatusIndicator,
} from "@cloudscape-design/components";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/hooks/useTranslation";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SettingsContainer } from "@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";

export const GeneralSettings = () => {
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
        items={[
          {
            label: t("settings.maintenanceMode"),
            value: config.maintenanceMode ? (
              <StatusIndicator type="warning">
                {t("settings.maintenanceStatus", undefined, { status: "ON" })}
              </StatusIndicator>
            ) : (
              <StatusIndicator type="success">
                {t("settings.maintenanceStatus", undefined, { status: "OFF" })}
              </StatusIndicator>
            ),
          },
          {
            label: t("settings.regions"),
            value:
              (config.isbManagedRegions || []).length > 0 ? (
                <ul data-list>
                  {config.isbManagedRegions.map((region) => (
                    <li key={region}>{region}</li>
                  ))}
                </ul>
              ) : (
                <StatusIndicator type="warning">
                  {t("common.notSet")}
                </StatusIndicator>
              ),
          },
          {
            label: t("settings.termsOfService"),
            value: (
              <Container>
                <pre>{config.termsOfService}</pre>
              </Container>
            ),
          },
        ]}
      />
    </SettingsContainer>
  );
};