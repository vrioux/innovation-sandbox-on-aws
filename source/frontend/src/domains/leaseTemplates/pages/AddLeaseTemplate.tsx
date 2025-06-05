// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes } from "@aws-northstar/ui";
import { useNavigate } from "react-router-dom";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Form } from "@amzn/innovation-sandbox-frontend/components/Form";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { showSuccessToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/hooks/useTranslation";
import { basicFormFields } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/formFields/basic";
import { budgetFields } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/formFields/budget";
import { durationFields } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/formFields/duration";
import { useAddLeaseTemplate } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import {
  LeaseTemplateFormData,
  NewLeaseTemplate,
} from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/types";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";

export const AddLeaseTemplate = () => {
  const navigate = useNavigate();
  const setBreadcrumb = useBreadcrumb();
  const { t } = useTranslation();

  const { mutateAsync: addLeaseTemplate, isPending: isSaving } =
    useAddLeaseTemplate();

  // get global settings
  const {
    data: config,
    isLoading: isLoadingConfig,
    isError: isConfigError,
    refetch: refetchConfig,
    error,
  } = useGetConfigurations();

  useInit(() => {
    setBreadcrumb([
      { text: t("common.home", "Home"), href: "/" },
      { text: t("leaseTemplates.title", "Lease Templates"), href: "/lease_templates" },
      { text: t("leaseTemplates.add.title", "Add a New Lease Template"), href: "/lease_templates/new" },
    ]);
  });

  const onSubmit = async (data: any) => {
    const {
      maxBudgetEnabled,
      maxSpend,
      maxDurationEnabled,
      leaseDurationInHours,
      ...rest
    } = data as LeaseTemplateFormData;

    const leaseTemplate: NewLeaseTemplate = {
      ...rest,
      maxSpend: maxBudgetEnabled ? maxSpend : undefined,
      leaseDurationInHours: maxDurationEnabled
        ? leaseDurationInHours
        : undefined,
    };

    await addLeaseTemplate(leaseTemplate);
    showSuccessToast(t("leaseTemplates.add.success", "New lease template added successfully."));
    navigate("/lease_templates");
  };

  const onCancel = () => {
    navigate("/lease_templates");
  };

  if (isLoadingConfig) {
    return <Loader />;
  }

  if (isConfigError) {
    return (
      <ErrorPanel
        description={t("leaseTemplates.add.error.config", "There was a problem loading global configuration settings.")}
        retry={refetchConfig}
        error={error as Error}
      />
    );
  }

  return (
    <Form
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSaving}
      initialValues={{
        requiresApproval: true,
        maxBudgetEnabled: true,
        maxDurationEnabled: true,
      }}
      schema={{
        header: t("leaseTemplates.add.title", "Add a New Lease Template"),
        description: t("leaseTemplates.add.description", "Give your users a new way to access a temporary AWS account."),
        fields: [
          {
            component: componentTypes.WIZARD,
            name: "wizard",
            allowSkipTo: true,
            fields: [
              { ...basicFormFields() },
              {
                ...budgetFields({ globalMaxBudget: config?.leases.maxBudget }),
              },
              {
                ...durationFields({
                  globalMaxDuration: config?.leases.maxDurationHours,
                }),
              },
            ],
          },
        ],
      }}
    />
  );
};
