// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValuePairs, StatusIndicator } from "@cloudscape-design/components";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/hooks/useTranslation";

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
        columns={2}
        items={[
          {
            label: t("settings.cleanup.waitSuccess"),
            value: config.cleanup.waitBeforeRerunSuccessfulAttemptSeconds ? (
              t("settings.cleanup.waitSuccessValue", undefined, { seconds: config.cleanup.waitBeforeRerunSuccessfulAttemptSeconds })
            ) : (
              <StatusIndicator type="warning">
                {t("common.notSet")}
              </StatusIndicator>
            ),
          },
          {
            label: t("settings.cleanup.failedAttempts"),
            value: config.cleanup.numberOfFailedAttemptsToCancelCleanup ? (
              <>{config.cleanup.numberOfFailedAttemptsToCancelCleanup}</>
            ) : (
              <StatusIndicator type="warning">
                {t("common.notSet")}
              </StatusIndicator>
            ),
          },
          {
            label: t("settings.cleanup.waitFailed"),
            value: config.cleanup.waitBeforeRetryFailedAttemptSeconds ? (
              t("settings.cleanup.waitFailedValue", undefined, { seconds: config.cleanup.waitBeforeRetryFailedAttemptSeconds })
            ) : (
              <StatusIndicator type="warning">
                {t("common.notSet")}
              </StatusIndicator>
            ),
          },
          {
            label: t("settings.cleanup.successAttempts"),
            value: config.cleanup.numberOfSuccessfulAttemptsToFinishCleanup ? (
              <>{config.cleanup.numberOfSuccessfulAttemptsToFinishCleanup}</>
            ) : (
              <StatusIndicator type="warning">
                {t("common.notSet")}
              </StatusIndicator>
            ),
          },
        ]}
      />
    </SettingsContainer>
  );
};