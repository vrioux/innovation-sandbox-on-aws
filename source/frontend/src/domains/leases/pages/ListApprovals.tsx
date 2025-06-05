// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Table } from "@aws-northstar/ui";
import {
  Button,
  ButtonDropdown,
  ContentLayout,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import moment from "moment";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { LeaseWithLeaseId as Lease } from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { InfoLink } from "@amzn/innovation-sandbox-frontend/components/InfoLink";
import { Markdown } from "@amzn/innovation-sandbox-frontend/components/Markdown";
import { BatchActionReview } from "@amzn/innovation-sandbox-frontend/components/MultiSelectTableActionReview";
import { TextLink } from "@amzn/innovation-sandbox-frontend/components/TextLink";
import {
  showErrorToast,
  showSuccessToast,
} from "@amzn/innovation-sandbox-frontend/components/Toast";
import {
  useGetPendingApprovals,
  useReviewLease,
} from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useModal } from "@amzn/innovation-sandbox-frontend/hooks/useModal";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

const DateRequestedCell = ({ lease }: { lease: Lease }) => (
  <>{moment(lease.meta?.createdTime).fromNow()}</>
);

const CommentsCell = ({ lease }: { lease: Lease }) => <>{lease.comments}</>;

const RequestorCell = ({
  lease,
  includeLinks,
}: {
  lease: Lease;
  includeLinks: boolean;
}) =>
  includeLinks ? (
    <TextLink to={`/approvals/${lease.leaseId}`}>{lease.userEmail}</TextLink>
  ) : (
    lease.userEmail
  );

// Review modal content component
type ReviewModalContentProps = {
  selectedRequests: Lease[];
  mode: "approve" | "deny";
  reviewLease: (params: { leaseId: string; approve: boolean }) => Promise<any>;
};

const createColumnDefinitions = (includeLinks: boolean, intl: any) => [
  {
    id: "requestor",
    header: intl.formatMessage({ id: "approvals.table.requestedBy" }),
    sortingField: "requestor.name",
    cell: (
      lease: Lease,
    ) => <RequestorCell lease={lease} includeLinks={includeLinks} />,
  },
  {
    id: "originalLeaseTemplateName",
    header: intl.formatMessage({ id: "approvals.table.leaseTemplate" }),
    sortingField: "originalLeaseTemplateName",
    cell: (lease: Lease) => lease.originalLeaseTemplateName,
  },
  {
    id: "dateRequested",
    header: intl.formatMessage({ id: "approvals.table.requested" }),
    sortingField: "dateRequested",
    cell: (lease: Lease) => <DateRequestedCell lease={lease} />,
  },
  {
    id: "comments",
    header: intl.formatMessage({ id: "approvals.table.comments" }),
    sortingField: "comments",
    cell: (lease: Lease) => <CommentsCell lease={lease} />,
  },
];

const ReviewModalContent = ({
  selectedRequests,
  mode,
  reviewLease,
}: ReviewModalContentProps) => {
  const intl = useIntl();
  return (
    <BatchActionReview
      items={selectedRequests}
      description={intl.formatMessage(
        { id: "approvals.modal.description" },
        { count: selectedRequests.length }
      )}
      columnDefinitions={createColumnDefinitions(false, intl)}
      identifierKey="leaseId"
      onSubmit={async (lease: Lease) => {
        await reviewLease({
          leaseId: lease.leaseId,
          approve: mode === "approve",
        });
      }}
      onSuccess={() => {
        showSuccessToast(
          intl.formatMessage({
            id: mode === "approve"
              ? "approvals.toast.success.approve"
              : "approvals.toast.success.deny",
          })
        );
      }}
      onError={() =>
        showErrorToast(
          intl.formatMessage({ id: "approvals.toast.error" }),
          intl.formatMessage({ id: "approvals.toast.error.title" })
        )
      }
    />
  );
};

export const ListApprovals = () => {
  // base ui hooks
  const setBreadcrumb = useBreadcrumb();
  const { setTools } = useAppLayoutContext();
  const intl = useIntl();

  // modal hook
  const { showModal } = useModal();

  // state
  const [selectedRequests, setSelectedRequests] = useState<Lease[]>([]);

  // api hooks
  const { data: requests, isFetching, refetch } = useGetPendingApprovals();
  const { mutateAsync: reviewLease } = useReviewLease();

  const init = async () => {
    setBreadcrumb([
      { text: intl.formatMessage({ id: "common.home" }), href: "/" },
      { text: intl.formatMessage({ id: "approvals.title" }), href: "/approvals" },
    ]);
    setTools(<Markdown file="approvals" />);
  };

  useEffect(() => {
    init();
  }, []);

  const showReviewModal = (mode: "approve" | "deny") => {
    showModal({
      header: intl.formatMessage({
        id: mode === "approve"
          ? "approvals.modal.approve"
          : "approvals.modal.deny",
      }),
      content: (
        <ReviewModalContent
          selectedRequests={selectedRequests}
          mode={mode}
          reviewLease={reviewLease}
        />
      ),
      size: "max",
    });
  };

  const handleSelectionChange = ({ detail }: { detail: any }) => {
    const approvals = detail.selectedItems as Lease[];
    setSelectedRequests(approvals);
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          info={<InfoLink markdown="approvals" />}
          description={<FormattedMessage id="approvals.description" />}
        >
          <FormattedMessage id="approvals.title" />
        </Header>
      }
    >
      <Table
        stripedRows
        trackBy="leaseId"
        columnDefinitions={createColumnDefinitions(true, intl)}
        header={<FormattedMessage id="approvals.table.header" />}
        totalItemsCount={(requests || []).length}
        items={requests || []}
        selectedItems={selectedRequests}
        onSelectionChange={handleSelectionChange}
        loading={isFetching}
        empty={<FormattedMessage id="approvals.noPending" />}
        actions={
          <SpaceBetween direction="horizontal" size="s">
            <Button
              iconName="refresh"
              onClick={() => refetch()}
              disabled={isFetching}
            />
            <ButtonDropdown
              disabled={selectedRequests.length === 0}
              items={[
                {
                  text: intl.formatMessage({ id: "approvals.actions.approve" }),
                  id: "approve",
                },
                {
                  text: intl.formatMessage({ id: "approvals.actions.deny" }),
                  id: "deny",
                },
              ]}
              onItemClick={({ detail }) => {
                showReviewModal(detail.id === "approve" ? "approve" : "deny");
              }}
            >
              <FormattedMessage id="common.actions" />
            </ButtonDropdown>
          </SpaceBetween>
        }
      />
    </ContentLayout>
  );
};