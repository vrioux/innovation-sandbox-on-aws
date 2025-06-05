// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { Alert, Box } from "@cloudscape-design/components";
import { useTranslation } from "../../../hooks/useTranslation";

export const basicFormFields = () => {
  const { t } = useTranslation();
  return {
    name: "basic",
    title: t("leaseTemplates.basicDetails", "Basic Details"),
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        name: "name",
        label: t("leaseTemplates.nameField", "Name"),
        isRequired: true,
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: t("common.error.required", "This field is required"),
          },
        ],
      },
      {
        component: componentTypes.TEXTAREA,
        name: "description",
        label: t("leaseTemplates.descriptionField", "Description"),
        description: t("leaseTemplates.optional", "Optional"),
      },
      {
        component: componentTypes.SWITCH,
        name: "requiresApproval",
        label: t("leaseTemplates.approvalRequired", "Approval required"),
      },
      {
        component: componentTypes.PLAIN_TEXT,
        name: "warning",
        label: (
          <Box data-inline-block>
            <Alert type="warning">
              When a user requests this lease template, an account will
              automatically be provided to the user if one is available in the
              account pool.
            </Alert>
          </Box>
        ),
        condition: {
          not: {
            when: "requiresApproval",
            is: true,
          },
          then: {
            visible: true,
          },
        },
      },
    ],
  };
};
