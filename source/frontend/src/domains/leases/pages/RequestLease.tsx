// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";

import { Form } from "@amzn/innovation-sandbox-frontend/components/Form";
import { showSuccessToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import { ReviewTemplate } from "@amzn/innovation-sandbox-frontend/domains/leases/components/ReviewTemplate";
import { SelectLeaseTemplate } from "@amzn/innovation-sandbox-frontend/domains/leases/components/SelectLeaseTemplate";
import { TermsOfService } from "@amzn/innovation-sandbox-frontend/domains/leases/components/TermsOfService";
import { useRequestNewLease } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { NewLeaseRequest } from "@amzn/innovation-sandbox-frontend/domains/leases/types";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";

export const RequestLease = () => {
  const navigate = useNavigate();
  const setBreadcrumb = useBreadcrumb();
  const intl = useIntl();

  const { mutateAsync: requestNewLease, isPending: isSubmitting } =
    useRequestNewLease();

  useInit(() => {
    setBreadcrumb([
      { text: intl.formatMessage({ id: "common.home" }), href: "/" },
      { text: intl.formatMessage({ id: "requestLease.title" }), href: "/request" },
    ]);
  });

  const onSubmit = async (data: unknown) => {
    const formData = data as NewLeaseRequest;

    const request = {
      leaseTemplateUuid: formData.leaseTemplateUuid,
      comments: formData.comments,
    } as NewLeaseRequest;

    await requestNewLease(request);
    navigate("/");
    showSuccessToast(intl.formatMessage({ id: "requestLease.successToast" }));
  };

  const onCancel = () => {
    navigate("/");
  };

  return (
    <>
      <Form
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
        schema={{
          header: intl.formatMessage({ id: "requestLease.title" }),
          description: intl.formatMessage({ id: "requestLease.description" }),
          fields: [
            {
              component: componentTypes.WIZARD,
              name: "wizard",
              allowSkipTo: true,
              fields: [
                {
                  name: "lease-template",
                  title: intl.formatMessage({ id: "requestLease.selectTemplate" }),
                  fields: [
                    {
                      component: componentTypes.CUSTOM,
                      label: intl.formatMessage({ id: "requestLease.templateQuestion" }),
                      CustomComponent: SelectLeaseTemplate,
                      isRequired: true,
                      name: "leaseTemplateUuid",
                      validate: [
                        {
                          type: validatorTypes.REQUIRED,
                          message: intl.formatMessage({ id: "common.error.required" }),
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "terms",
                  title: intl.formatMessage({ id: "requestLease.termsOfService" }),
                  fields: [
                    {
                      component: componentTypes.PLAIN_TEXT,
                      name: "terms",
                      label: <TermsOfService />,
                    },
                    {
                      component: componentTypes.CHECKBOX,
                      name: "acceptTerms",
                      label: intl.formatMessage({ id: "requestLease.acceptTerms" }),
                      validate: [
                        {
                          type: validatorTypes.REQUIRED,
                          message: intl.formatMessage({ id: "requestLease.acceptTermsRequired" }),
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "review",
                  title: intl.formatMessage({ id: "requestLease.reviewSubmit" }),
                  fields: [
                    {
                      component: componentTypes.REVIEW,
                      name: "review",
                      Template: ReviewTemplate,
                    },
                    {
                      component: componentTypes.TEXTAREA,
                      name: "comments",
                      label: intl.formatMessage({ id: "common.comments" }),
                      description: intl.formatMessage({ id: "requestLease.commentsDescription" }),
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    </>
  );
};
