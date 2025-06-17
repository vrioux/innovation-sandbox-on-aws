// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Table } from "@aws-northstar/ui";
import {
  Box,
  Button,
  ButtonDropdown,
  ColumnLayout,
  Container,
  ContentLayout,
  FormField,
  Header,
  Multiselect,
  MultiselectProps,
  SelectProps,
  SpaceBetween,
  StatusIndicator,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";

import {
  ApprovalDeniedLeaseStatusSchema,
  ExpiredLeaseStatusSchema,
  isApprovalDeniedLease,
  isExpiredLease,
  isMonitoredLease,
  isPendingLease,
  LeaseWithLeaseId as Lease,
  LeaseStatus,
  MonitoredLeaseStatusSchema,
  PendingLeaseStatusSchema,
} from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { AccountLoginLink } from "@amzn/innovation-sandbox-frontend/components/AccountLoginLink";
import { BudgetProgressBar } from "@amzn/innovation-sandbox-frontend/components/BudgetProgressBar";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { InfoLink } from "@amzn/innovation-sandbox-frontend/components/InfoLink";
import { Markdown } from "@amzn/innovation-sandbox-frontend/components/Markdown";
import { BatchActionReview } from "@amzn/innovation-sandbox-frontend/components/MultiSelectTableActionReview";
import { TextLink } from "@amzn/innovation-sandbox-frontend/components/TextLink";
import {
  showErrorToast,
  showSuccessToast,
} from "@amzn/innovation-sandbox-frontend/components/Toast";
import { LeaseStatusBadge } from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseStatusBadge";
import {
  getLeaseStatusDisplayName,
  leaseStatusSortingComparator,
} from "@amzn/innovation-sandbox-frontend/domains/leases/helpers";
import {
  useFreezeLease,
  useGetLeases,
  useTerminateLease,
} from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useModal } from "@amzn/innovation-sandbox-frontend/hooks/useModal";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

const useFilterOptions = () => {
  const intl = useIntl();
const filterOptions: SelectProps.Options = [
  {
      label: intl.formatMessage({ id: "status.active", defaultMessage: "Active" }),
    options: MonitoredLeaseStatusSchema.options.map((status) => ({
        label: intl.formatMessage({ id: `status.${status.toLowerCase()}`, defaultMessage: getLeaseStatusDisplayName(status as LeaseStatus) }),
      value: status,
    })),
  },
  {
      label: intl.formatMessage({ id: "status.pending", defaultMessage: "Pending" }),
    options: [
      {
          label: intl.formatMessage({ id: `status.${PendingLeaseStatusSchema.value.toLowerCase()}`, defaultMessage: getLeaseStatusDisplayName(PendingLeaseStatusSchema.value) }),
        value: PendingLeaseStatusSchema.value,
      },
    ],
  },
  {
      label: intl.formatMessage({ id: "status.expired", defaultMessage: "Expired" }),
    options: [
      ...ExpiredLeaseStatusSchema.options,
      ApprovalDeniedLeaseStatusSchema.value,
    ].map((status) => ({
        label: intl.formatMessage({ id: `status.${status.toLowerCase()}`, defaultMessage: getLeaseStatusDisplayName(status as LeaseStatus) }),
      value: status,
    })),
  },
];
  return filterOptions;
};

const UserCell = ({
  lease,
  includeLinks,
}: {
  lease: Lease;
  includeLinks: boolean;
}) =>
  includeLinks ? (
    <TextLink to={`/leases/edit/${lease.leaseId}`}>{lease.userEmail}</TextLink>
  ) : (
    lease.userEmail
  );

const BudgetCell = ({ lease }: { lease: Lease }) => {
  const intl = useIntl();
  return isMonitoredLease(lease) || isExpiredLease(lease) ? (
    <BudgetProgressBar
      currentValue={lease.totalCostAccrued}
      maxValue={lease.maxSpend}
    />
  ) : (
    intl.formatMessage({ id: "leases.noCosts", defaultMessage: "No costs accrued" })
  );
};

const ExpiryCell = ({ lease }: { lease: Lease }) => {
  const intl = useIntl();
  if (isPendingLease(lease) || isApprovalDeniedLease(lease)) {
    return <DurationStatus durationInHours={lease.leaseDurationInHours} />;
  } else if (isMonitoredLease(lease)) {
    return lease.expirationDate ? (
      <DurationStatus
        date={lease.expirationDate}
        durationInHours={lease.leaseDurationInHours}
      />
    ) : (
      <StatusIndicator type="info">{intl.formatMessage({ id: "leases.noExpiry", defaultMessage: "No expiry" })}</StatusIndicator>
    );
  } else if (isExpiredLease(lease)) {
    return <DurationStatus date={lease.endDate} expired={true} />;
  }
  return null;
};

const AwsAccountCell = ({ lease }: { lease: Lease }) => {
  const intl = useIntl();
  return isMonitoredLease(lease) || isExpiredLease(lease) ? (
    lease.awsAccountId
  ) : (
    <StatusIndicator type="warning">{intl.formatMessage({ id: "leases.noAccount", defaultMessage: "No account assigned" })}</StatusIndicator>
  );
};

const AccessCell = ({ lease }: { lease: Lease }) => (
  <>
    {isMonitoredLease(lease) && (
      <AccountLoginLink accountId={lease.awsAccountId} />
    )}
  </>
);

type ActionModalContentProps = {
  selectedLeases: Lease[];
  action: "terminate" | "freeze";
  onAction: (leaseId: string) => Promise<any>;
};

const createColumnDefinitions = (includeLinks: boolean, intl: any) =>
  [
    {
      id: "user",
      header: intl.formatMessage({ id: "common.user", defaultMessage: "User" }),
      sortingField: "userEmail",
      cell: (lease: Lease) => (
        <UserCell lease={lease} includeLinks={includeLinks} />
      ),
    },
    {
      id: "originalLeaseTemplateName",
      header: intl.formatMessage({ id: "leaseTemplate.title", defaultMessage: "Lease Template" }),
      sortingField: "originalLeaseTemplateName",
      cell: (lease: Lease) => lease.originalLeaseTemplateName,
    },
    {
      id: "budget",
      header: intl.formatMessage({ id: "common.budget", defaultMessage: "Budget" }),
      sortingField: "totalCostAccrued",
      cell: (lease: Lease) => <BudgetCell lease={lease} />,
    },
    {
      id: "expirationDate",
      header: intl.formatMessage({ id: "leaseTemplate.expiry", defaultMessage: "Expiry" }),
      sortingField: "expirationDate",
      cell: (lease: Lease) => <ExpiryCell lease={lease} />,
    },
    {
      id: "status",
      header: intl.formatMessage({ id: "common.status", defaultMessage: "Status" }),
      sortingComparator: leaseStatusSortingComparator,
      cell: (lease: Lease) => <LeaseStatusBadge lease={lease} />,
    },
    {
      id: "awsAccountId",
      header: intl.formatMessage({ id: "common.account", defaultMessage: "AWS Account" }),
      sortingField: "awsAccountId",
      cell: (lease: Lease) => <AwsAccountCell lease={lease} />,
    },
    {
      id: "link",
      header: intl.formatMessage({ id: "common.access", defaultMessage: "Access" }),
      cell: (lease: Lease) => <AccessCell lease={lease} />,
    },
  ].filter((column) => includeLinks || column.id !== "link");

const ActionModalContent = ({
  selectedLeases,
  action,
  onAction,
}: ActionModalContentProps) => {
  const intl = useIntl();
  return (
    <BatchActionReview
      items={selectedLeases}
      description={intl.formatMessage(
        { id: `leases.${action}.description`, defaultMessage: "{count} lease(s) to {action}" },
        { count: selectedLeases.length, action }
      )}
      columnDefinitions={createColumnDefinitions(false, intl)}
      identifierKey="leaseId"
      onSubmit={async (lease: Lease) => {
        await onAction(lease.leaseId);
      }}
      onSuccess={() => {
        showSuccessToast(
          intl.formatMessage(
            { id: `leases.${action}.success`, defaultMessage: "Leases(s) were {action}d successfully." },
            { action }
          )
        );
      }}
      onError={() =>
        showErrorToast(
          intl.formatMessage(
            { id: `leases.${action}.error`, defaultMessage: "One or more leases failed to {action}, try resubmitting." },
            { action }
          ),
          intl.formatMessage(
            { id: `leases.${action}.error.title`, defaultMessage: "Failed to {action} lease(s)" },
            { action }
          )
        )
      }
    />
  );
};

export const ListLeases = () => {
  const navigate = useNavigate();
  const { setTools } = useAppLayoutContext();
  const setBreadcrumb = useBreadcrumb();
  const intl = useIntl();
  const filterOptions = useFilterOptions();
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  const [selectedLeases, setSelectedLeases] = useState<Lease[]>([]);
  const [leaseTemplates, setLeaseTemplates] = useState<SelectProps.Options>([]);
  const { showModal } = useModal();

  // default status filter to active leases
  const [statusFilter, setStatusFilter] = useState<SelectProps.Options>(
    (filterOptions[0] as SelectProps.OptionGroup).options,
  );
  const [leaseTemplateFilter, setLeaseTemplateFilter] =
    useState<SelectProps.Options>([]);

  const { data: leases, isFetching, refetch } = useGetLeases();

  const { mutateAsync: terminateLease } = useTerminateLease();

  const { mutateAsync: freezeLease } = useFreezeLease();

  const init = async () => {
    setBreadcrumb([
      { text: intl.formatMessage({ id: "common.home", defaultMessage: "Home" }), href: "/" },
      { text: intl.formatMessage({ id: "leases.title", defaultMessage: "Leases" }), href: "/leases" },
    ]);
    setTools(<Markdown file="leases" />);
  };

  const filterLeases = (leases: Lease[]) => {
    // filter by status
    const filteredByStatus =
      statusFilter.length > 0
        ? leases.filter((lease) =>
            statusFilter.map((x) => x.value).includes(lease.status),
          )
        : leases;

    // filter by lease template
    const filterByLeaseTemplate =
      leaseTemplateFilter.length > 0
        ? filteredByStatus.filter((lease) =>
            leaseTemplateFilter
              .map((x) => x.value)
              .includes(lease.originalLeaseTemplateName),
          )
        : filteredByStatus;

    return filterByLeaseTemplate;
  };

  useEffect(() => {
    if (leases) {
      // get list of unique lease template names from list of leases
      const uniqueLeaseTemplateNames: string[] = [
        ...new Set(leases.map((lease) => lease.originalLeaseTemplateName)),
      ];
      const leaseTemplateOptions: SelectProps.Options =
        uniqueLeaseTemplateNames.map((type) => ({ value: type, label: type }));

      // populate lease template filter dropdown
      setLeaseTemplates(leaseTemplateOptions);

      // update filtered list of leases
      setFilteredLeases(filterLeases(leases));
    }
  }, [leases]);

  useEffect(() => {
    // update filtered list of leases
    setFilteredLeases(filterLeases(leases ?? []));
  }, [statusFilter, leaseTemplateFilter]);

  useEffect(() => {
    init();
  }, []);

  const handleSelectionChange = ({ detail }: { detail: any }) => {
    const approvals = detail.selectedItems as Lease[];
    setSelectedLeases(approvals);
  };

  const showTerminateModal = () => {
    showModal({
      header: intl.formatMessage({ id: "leases.terminate.title", defaultMessage: "Terminate Lease(s)" }),
      content: (
        <ActionModalContent
          selectedLeases={selectedLeases}
          action="terminate"
          onAction={terminateLease}
        />
      ),
      size: "max",
    });
  };

  const showFreezeModal = () => {
    showModal({
      header: intl.formatMessage({ id: "leases.freeze.title", defaultMessage: "Freeze Lease(s)" }),
      content: (
        <ActionModalContent
          selectedLeases={selectedLeases}
          action="freeze"
          onAction={freezeLease}
        />
      ),
      size: "max",
    });
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          info={<InfoLink markdown="leases" />}
          description={intl.formatMessage({ id: "leases.description", defaultMessage: "Manage sandbox account leases" })}
        >
          {intl.formatMessage({ id: "leases.title", defaultMessage: "Leases" })}
        </Header>
      }
    >
      <SpaceBetween size="s">
        <Container header={<Header variant="h3">{intl.formatMessage({ id: "filter.options", defaultMessage: "Filter Options" })}</Header>}>
          <ColumnLayout columns={3}>
            <Box>
              <FormField label={intl.formatMessage({ id: "common.status", defaultMessage: "Status" })} />
              <Multiselect
                data-testid="status-filter"
                selectedOptions={statusFilter}
                onChange={({ detail }) =>
                  setStatusFilter(
                    detail.selectedOptions as MultiselectProps.Option[],
                  )
                }
                options={filterOptions}
                placeholder={intl.formatMessage({ id: "filter.chooseOptions", defaultMessage: "Choose options" })}
              />
            </Box>
            <Box>
              <FormField label={intl.formatMessage({ id: "leaseTemplate.title", defaultMessage: "Lease Template" })} />
              <Multiselect
                selectedOptions={leaseTemplateFilter}
                onChange={({ detail }) =>
                  setLeaseTemplateFilter(
                    detail.selectedOptions as MultiselectProps.Option[],
                  )
                }
                options={leaseTemplates}
                placeholder={intl.formatMessage({ id: "filter.chooseOptions", defaultMessage: "Choose options" })}
                loadingText={intl.formatMessage({ id: "common.loading", defaultMessage: "Loading..." })}
                empty={intl.formatMessage({ id: "leases.noLeases", defaultMessage: "No leases found" })}
                statusType={isFetching ? "loading" : undefined}
              />
            </Box>
          </ColumnLayout>
        </Container>
        <Table
          stripedRows
          trackBy="leaseId"
          columnDefinitions={createColumnDefinitions(true, intl)}
          header={intl.formatMessage({ id: "leases.title", defaultMessage: "Leases" })}
          totalItemsCount={(filteredLeases || []).length}
          items={filteredLeases || []}
          selectedItems={selectedLeases}
          onSelectionChange={handleSelectionChange}
          loading={isFetching}
          actions={
            <SpaceBetween direction="horizontal" size="s">
              <Button
                iconName="refresh"
                ariaLabel={intl.formatMessage({ id: "common.refresh", defaultMessage: "Refresh" })}
                onClick={() => refetch()}
                disabled={isFetching}
              />
              <ButtonDropdown
                disabled={selectedLeases.length === 0}
                items={[
                  {
                    text: intl.formatMessage({ id: "leases.actions.terminate", defaultMessage: "Terminate" }),
                    id: "terminate",
                    disabled: !selectedLeases.every(
                      (lease) =>
                        lease.status === "Active" || lease.status === "Frozen",
                    ),
                    disabledReason: intl.formatMessage({ id: "leases.actions.terminate.disabled", defaultMessage: "Only active or frozen leases can be terminated." }),
                  },
                  {
                    text: intl.formatMessage({ id: "leases.actions.freeze", defaultMessage: "Freeze" }),
                    id: "freeze",
                    disabled: !selectedLeases.every(
                      (lease) => lease.status === "Active",
                    ),
                    disabledReason: intl.formatMessage({ id: "leases.actions.freeze.disabled", defaultMessage: "Only active leases can be frozen." }),
                  },
                  {
                    text: intl.formatMessage({ id: "common.update", defaultMessage: "Update" }),
                    id: "update",
                    disabled: selectedLeases.length > 1,
                    disabledReason: intl.formatMessage({ id: "leases.actions.update.disabled", defaultMessage: "Only a single lease can be updated at a time." }),
                  },
                ]}
                onItemClick={({ detail }) => {
                  switch (detail.id) {
                    case "terminate":
                      showTerminateModal();
                      break;
                    case "freeze":
                      showFreezeModal();
                      break;
                    case "update":
                      navigate(`/leases/edit/${selectedLeases[0].leaseId}`);
                      break;
                  }
                }}
              >
                {intl.formatMessage({ id: "common.actions", defaultMessage: "Actions" })}
              </ButtonDropdown>
            </SpaceBetween>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
};
