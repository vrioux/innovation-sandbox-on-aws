// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { FormField } from "@cloudscape-design/components";
import { useTranslation } from "../../../hooks/useTranslation";

import { Divider } from "@amzn/innovation-sandbox-frontend/components/Divider";
import { NumberFormField } from "@amzn/innovation-sandbox-frontend/components/NumberFormField";
import { ThresholdSettings } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings";
import { thresholdValidator } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings/validator";
import { validateNumber } from "@amzn/innovation-sandbox-frontend/helpers/validators";

interface DurationFieldsProps {
  alwaysShowValidationErrors?: boolean;
  globalMaxDuration?: number;
}

export const durationFields = (props?: DurationFieldsProps) => {
  const { t } = useTranslation();
  return {
    name: "duration",
    title: t("leaseTemplates.leaseDuration", "Lease Duration"),
    fields: [
      {
        component: componentTypes.RADIO,
        name: "maxDurationEnabled",
        label: <FormField label={t("leaseTemplates.duration.maxDuration", "Maximum Duration")} />,
        options: [
          {
            label: t("leaseTemplates.duration.noMax", "Do not set a maximum duration"),
            value: false,
          },
          {
            label: t("leaseTemplates.duration.setMax", "Set a maximum duration"),
            value: true,
          },
        ],
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: t("common.error.required", "This field is required"),
          },
        ],
      },
      {
        component: componentTypes.CUSTOM,
        CustomComponent: NumberFormField,
        isCurrency: false,
        name: "leaseDurationInHours",
        showError: props?.alwaysShowValidationErrors,
        label: <FormField label={t("leaseTemplates.duration.maxHours", "Maximum Lease Duration (in hours)")} />,
        validate: [
          validateNumber,
          (val: number) =>
            !!props?.globalMaxDuration && val > props.globalMaxDuration
              ? t("leaseTemplates.duration.maxError", "Maximum lease duration is {hours} hours", { hours: props.globalMaxDuration })
              : undefined,
        ],
        condition: {
          when: "maxDurationEnabled",
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
          when: "maxDurationEnabled",
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
        label: t("leaseTemplates.duration.thresholds", "Duration Thresholds"),
        description: t("leaseTemplates.duration.thresholdsDesc", "Determine what happens as time passes."),
        thresholdType: "duration",
        validate: [thresholdValidator("duration")],
        showError: props?.alwaysShowValidationErrors,
        condition: {
          when: "maxDurationEnabled",
          is: true,
          then: {
            visible: true,
          },
        },
      },
    ],
  };
};
