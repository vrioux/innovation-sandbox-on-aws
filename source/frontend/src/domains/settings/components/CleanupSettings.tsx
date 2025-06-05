// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValuePairs, StatusIndicator } from "@cloudscape-design/components";
import { FormattedMessage, useIntl } from "react-intl";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SettingsContainer } from "@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";

export const CleanupSettings = () => {
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
        columns={2}
        items={[
          {
            label: <FormattedMessage id="settings.cleanup.waitSuccess" />,
            value: config.cleanup.waitBeforeRerunSuccessfulAttemptSeconds ? (
              <FormattedMessage 
                id="settings.cleanup.waitSuccessValue" 
                values={{ seconds: config.cleanup.waitBeforeRerunSuccessfulAttemptSeconds }} 
              />
            ) : (
              <StatusIndicator type="warning">
                <FormattedMessage id="common.notSet" />
              </StatusIndicator>
            ),
          },
          {
            label: <FormattedMessage id="settings.cleanup.failedAttempts" />,
            value: config.cleanup.numberOfFailedAttemptsToCancelCleanup ? (
              <>{config.cleanup.numberOfFailedAttemptsToCancelCleanup}</>
            ) : (
              <StatusIndicator type="warning">
                <FormattedMessage id="common.notSet" />
              </StatusIndicator>
            ),
          },
          {
            label: <FormattedMessage id="settings.cleanup.waitFailed" />,
            value: config.cleanup.waitBeforeRetryFailedAttemptSeconds ? (
              <FormattedMessage 
                id="settings.cleanup.waitFailedValue" 
                values={{ seconds: config.cleanup.waitBeforeRetryFailedAttemptSeconds }} 
              />
            ) : (
              <StatusIndicator type="warning">
                <FormattedMessage id="common.notSet" />
              </StatusIndicator>
            ),
          },
          {
            label: <FormattedMessage id="settings.cleanup.successAttempts" />,
            value: config.cleanup.numberOfSuccessfulAttemptsToFinishCleanup ? (
              <>{config.cleanup.numberOfSuccessfulAttemptsToFinishCleanup}</>
            ) : (
              <StatusIndicator type="warning">
                <FormattedMessage id="common.notSet" />
              </StatusIndicator>
            ),
          },
        ]}
      />
    </SettingsContainer>
  );
};
