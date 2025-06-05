// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Container,
  KeyValuePairs,
  StatusIndicator,
} from "@cloudscape-design/components";
import { FormattedMessage, useIntl } from "react-intl";

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
        items={[
          {
            label: <FormattedMessage id="settings.maintenanceMode" />,
            value: config.maintenanceMode ? (
              <StatusIndicator type="warning">
                <FormattedMessage 
                  id="settings.maintenanceStatus" 
                  values={{ status: "ON" }} 
                />
              </StatusIndicator>
            ) : (
              <StatusIndicator type="success">
                <FormattedMessage 
                  id="settings.maintenanceStatus" 
                  values={{ status: "OFF" }} 
                />
              </StatusIndicator>
            ),
          },
          {
            label: <FormattedMessage id="settings.regions" />,
            value:
              (config.isbManagedRegions || []).length > 0 ? (
                <ul data-list>
                  {config.isbManagedRegions.map((region) => (
                    <li key={region}>{region}</li>
                  ))}
                </ul>
              ) : (
                <StatusIndicator type="warning">
                  <FormattedMessage id="common.notSet" />
                </StatusIndicator>
              ),
          },
          {
            label: <FormattedMessage id="settings.termsOfService" />,
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
