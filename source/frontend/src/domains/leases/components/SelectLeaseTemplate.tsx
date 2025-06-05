// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FieldInputProps } from "@aws-northstar/ui";
import {
  Alert,
  Box,
  Cards,
  ColumnLayout,
  Container,
  FormField,
  Input,
  Pagination,
  SpaceBetween,
  StatusIndicator,
} from "@cloudscape-design/components";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from 'react-intl';

import { LeaseTemplate } from "@amzn/innovation-sandbox-commons/data/lease-template/lease-template";
import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { useGetLeaseTemplates } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import { formatCurrency } from "@amzn/innovation-sandbox-frontend/helpers/util";

interface SelectLeaseTemplateProps {
  input: FieldInputProps<HTMLInputElement>;
  data: Record<string, object>;
  label?: string;
  description?: string;
  showError: boolean;
  meta: {
    error: string | undefined;
  };
}

const LEASE_TEMPLATES_PER_PAGE = 12;
const LeaseTemplateCardContent = ({ option }: { option: LeaseTemplate }) => {
  const intl = useIntl();
  return (
    <SpaceBetween size="l">
      <div>{option.description}</div>
      <Container>
        <SpaceBetween size="l">
          <ColumnLayout columns={3} minColumnWidth={150} variant="text-grid">
            <Box>
              <FormField data-nowrap label={intl.formatMessage({ id: "lease.template.maxBudget" })} />
              {option.maxSpend ? (
                formatCurrency(option.maxSpend)
              ) : (
                <StatusIndicator type="info">{intl.formatMessage({ id: "lease.template.noMaxBudget" })}</StatusIndicator>
              )}
            </Box>

            <Box>
              <FormField data-nowrap label={intl.formatMessage({ id: "lease.template.expires" })} />
              {option.leaseDurationInHours ? (
                `after ${moment.duration(option.leaseDurationInHours, "hours").humanize()}`
              ) : (
                <StatusIndicator type="info">{intl.formatMessage({ id: "lease.template.noExpiry" })}</StatusIndicator>
              )}
            </Box>

            <Box>
              <FormField data-nowrap label={intl.formatMessage({ id: "lease.template.approval" })} />
              {option.requiresApproval ? (
                <StatusIndicator type="warning">
                  <span data-wrap>{intl.formatMessage({ id: "lease.template.requiresApproval" })}</span>
                </StatusIndicator>
              ) : (
                <StatusIndicator type="success">
                  <span data-wrap>{intl.formatMessage({ id: "lease.template.noApprovalRequired" })}</span>
                </StatusIndicator>
              )}
            </Box>
          </ColumnLayout>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

export const SelectLeaseTemplate = ({
  input,
  showError,
  label,
  description,
  meta: { error },
}: SelectLeaseTemplateProps) => {
  const [selectedLeaseTemplates, setSelectedLeaseTemplates] = useState<
    LeaseTemplate[]
  >([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    data: leaseTemplates,
    isLoading,
    isError,
    refetch,
    error: fetchError,
  } = useGetLeaseTemplates();

  const handleSelectionChange = ({ detail }: { detail: any }) => {
    if (detail.selectedItems.length > 0) {
      const leaseTemplate = detail.selectedItems[0];
      input.onChange(leaseTemplate.uuid);
    } else {
      input.onChange(undefined);
    }
  };

  // Filter templates by name
  const filteredLeaseTemplates = useMemo(() => {
    if (!leaseTemplates) return [];

    // If no search term, return all templates
    if (!searchTerm.trim()) {
      return leaseTemplates;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    return leaseTemplates.filter((template) =>
      template.name.toLowerCase().includes(normalizedSearchTerm),
    );
  }, [leaseTemplates, searchTerm]);

  // Update selected templates
  useEffect(() => {
    if (!input.value || !leaseTemplates) return;

    const leaseTemplate = leaseTemplates.find(
      (x) => x.uuid === input.value.toString(),
    );

    if (leaseTemplate) {
      setSelectedLeaseTemplates([leaseTemplate]);
    }
  }, [input.value, leaseTemplates]);

  // Calculate paginated items
  const paginatedLeaseTemplates = useMemo(() => {
    if (!filteredLeaseTemplates.length) return [];

    const startIndex = (currentPageIndex - 1) * LEASE_TEMPLATES_PER_PAGE;
    const endIndex = startIndex + LEASE_TEMPLATES_PER_PAGE;
    return filteredLeaseTemplates.slice(startIndex, endIndex);
  }, [filteredLeaseTemplates, currentPageIndex]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!filteredLeaseTemplates.length) return 1;
    return Math.ceil(filteredLeaseTemplates.length / LEASE_TEMPLATES_PER_PAGE);
  }, [filteredLeaseTemplates]);

  useEffect(() => {
    if (searchTerm !== "") {
      setCurrentPageIndex(1);
    }
  }, [searchTerm]);

  const intl = useIntl();

  if (isLoading) {
    return <Loader label={intl.formatMessage({ id: "lease.template.loading" })} />;
  }

  if (isError) {
    return (
      <ErrorPanel
        description={intl.formatMessage({ id: "lease.template.loadError" })}
        retry={refetch}
        error={fetchError as Error}
      />
    );
  }

  if ((leaseTemplates || []).length === 0) {
    return (
      <Alert type="error" header={intl.formatMessage({ id: "lease.template.noTemplates" })}>
        {intl.formatMessage({ id: "lease.template.contactAdmin" })}
      </Alert>
    );
  }

  if (!isLoading) {
    return (
      <SpaceBetween size="s">
        <FormField label={label} description={description} />
        <ColumnLayout columns={2}>
          <Box>
            <Input
              type="search"
              placeholder={intl.formatMessage({ id: "lease.template.searchPlaceholder" })}
              value={searchTerm}
              onChange={({ detail }) => setSearchTerm(detail.value)}
              ariaLabel={intl.formatMessage({ id: "lease.template.searchAriaLabel" })}
            />
          </Box>

          {totalPages > 1 && (
            <Box float="right">
              <Pagination
                currentPageIndex={currentPageIndex}
                pagesCount={totalPages}
                onChange={({ detail }) =>
                  setCurrentPageIndex(detail.currentPageIndex)
                }
                ariaLabels={{
                  nextPageLabel: intl.formatMessage({ id: "lease.template.pagination.next" }),
                  previousPageLabel: intl.formatMessage({ id: "lease.template.pagination.previous" }),
                  pageLabel: (pageNumber) =>
                    intl.formatMessage(
                      { id: "lease.template.pagination.page" },
                      { pageNumber, totalPages }
                    ),
                }}
              />
            </Box>
          )}
        </ColumnLayout>
        <Box>
          {filteredLeaseTemplates.length === 0 && searchTerm.trim() !== "" ? (
            <Alert type="info" header={intl.formatMessage({ id: "lease.template.noMatches.header" })}>
              {intl.formatMessage({ id: "lease.template.noMatches.description" })}
            </Alert>
          ) : (
            <Cards
              items={paginatedLeaseTemplates}
              selectedItems={selectedLeaseTemplates}
              onSelectionChange={handleSelectionChange}
              entireCardClickable
              selectionType="single"
              cardDefinition={{
                header: (option) => option.name,
                sections: [
                  {
                    // prettier-ignore
                    content: (option) => <LeaseTemplateCardContent option={option} />, // NOSONAR typescript:S6478 - the way the card component works requires defining component during render
                  },
                ],
              }}
            />
          )}
          <FormField errorText={showError && error}></FormField>
        </Box>
      </SpaceBetween>
    );
  }
};
