// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { Alert, FormField } from "@cloudscape-design/components";
import moment from "moment";

import { MonitoredLease } from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { DateTimeFormField } from "@amzn/innovation-sandbox-frontend/components/DateTimeFormField";
import { Divider } from "@amzn/innovation-sandbox-frontend/components/Divider";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { Form } from "@amzn/innovation-sandbox-frontend/components/Form";
import { ThresholdSettings } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings";
import { thresholdValidator } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings/validator";
import { useIntl } from "react-intl";

export type LeaseDurationFormProps = {
  expirationDate: MonitoredLease["expirationDate"];
  durationThresholds: MonitoredLease["durationThresholds"];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isUpdating?: boolean;
};

export type LeaseDurationFormData = {
  expirationDate: MonitoredLease["expirationDate"];
  durationThresholds: MonitoredLease["durationThresholds"];
  expiryDateEnabled: boolean;
};

export const LeaseDurationForm = ({
  expirationDate,
  durationThresholds,
  onSubmit,
  onCancel,
  isUpdating,
}: LeaseDurationFormProps) => {
  const intl = useIntl();

  return (
    <Form
      insideTab
      isSubmitting={isUpdating}
      onCancel={onCancel}
      onSubmit={onSubmit}
      initialValues={{
        expirationDate,
        durationThresholds,
        expiryDateEnabled: !!expirationDate,
      }}
      validate={(data) => {
        const formValues = data as LeaseDurationFormData;
        const validateDuration = thresholdValidator("duration");

        const durationError = validateDuration(
          formValues.durationThresholds,
          formValues,
        );

        if (durationError) {
          return {
            durationThresholds: durationError,
          };
        }
      }}
      schema={{
        submitLabel: intl.formatMessage({ id: "leaseDuration.updateSettings" }),
        fields: [
          {
            component: componentTypes.SUB_FORM,
            name: "duration",
            title: intl.formatMessage({ id: "leaseDuration.title" }),
            fields: [
              {
                component: componentTypes.PLAIN_TEXT,
                name: "info",
                label: (
                  <Alert type="info">
                    {expirationDate ? (
                      <>
                        {intl.formatMessage({ id: "leaseDuration.currentlyExpires" })}{" "}
                        <DurationStatus date={expirationDate} />
                      </>
                    ) : (
                      <>{intl.formatMessage({ id: "leaseDuration.noExpiry" })}</>
                    )}
                  </Alert>
                ),
              },
              {
                component: componentTypes.RADIO,
                name: "expiryDateEnabled",
                label: <FormField label={intl.formatMessage({ id: "leaseDuration.expiryDate" })} />,
                options: [
                  {
                    label: expirationDate
                      ? intl.formatMessage({ id: "leaseDuration.removeExpiry" })
                      : intl.formatMessage({ id: "leaseDuration.noExpiry" }),
                    value: false,
                  },
                  {
                    label: intl.formatMessage({ id: "leaseDuration.setExpiry" }),
                    value: true,
                  },
                ],
                validate: [
                  {
                    type: validatorTypes.REQUIRED,
                    message: intl.formatMessage({ id: "leaseDuration.selectOption" }),
                  },
                ],
              },
              {
                component: componentTypes.CUSTOM,
                CustomComponent: DateTimeFormField,
                isCurrency: false,
                name: "expirationDate",
                showError: true,
                validate: [
                  (date: Date) => {
                    if (!date) {
                      return intl.formatMessage({ id: "leaseDuration.enterValidDate" });
                    }

                    // Convert to moment object for easier comparison
                    const selectedDateTime = moment(date);
                    const oneHourFromNow = moment().add(1, "hour");

                    // Check if the date/time is at least 1 hour in the future
                    if (selectedDateTime.isBefore(oneHourFromNow)) {
                      return intl.formatMessage({ id: "leaseDuration.futureDate" });
                    }
                  },
                ],
                condition: {
                  when: "expiryDateEnabled",
                  is: true,
                  then: {
                    visible: true,
                  },
                },
              },
              {
                component: componentTypes.PLAIN_TEXT,
                name: "divider",
                label: <Divider />,
                condition: {
                  when: "expiryDateEnabled",
                  is: true,
                  then: {
                    visible: true,
                  },
                },
              },
              {
                component: componentTypes.CUSTOM,
                CustomComponent: ThresholdSettings,
                name: "durationThresholds",
                label: intl.formatMessage({ id: "leaseDuration.thresholds" }),
                description: intl.formatMessage({ id: "leaseDuration.thresholdsDescription" }),
                thresholdType: "duration",
                validate: [thresholdValidator("duration")],
                showError: true,
                condition: {
                  when: "expiryDateEnabled",
                  is: true,
                  then: {
                    visible: true,
                  },
                },
              },
            ],
          },
        ],
      }}
    />
  );
};
