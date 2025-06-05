// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DeleteConfirmationDialog } from "@aws-northstar/ui";
import Table from "@aws-northstar/ui/components/Table";
import {
  Box,
  Button,
  ButtonDropdown,
  SpaceBetween,
  StatusIndicator,
  TextContent,
} from "@cloudscape-design/components";
import moment from "moment";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { LeaseTemplate } from "@amzn/innovation-sandbox-commons/data/lease-template/lease-template";
import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { TextLink } from "@amzn/innovation-sandbox-frontend/components/TextLink";
import { showSuccessToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import {
  useDeleteLeaseTemplates,
  useGetLeaseTemplates,
} from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import { formatCurrency } from "@amzn/innovation-sandbox-frontend/helpers/util";

const NameCell = ({ item }: { item: LeaseTemplate }) => (
  <>
    <Box>
      <TextLink to={`/lease_templates/edit/${item.uuid}`}>{item.name}</TextLink>
    </Box>
    <Box>
      <small data-break-spaces>{item.description}</small>
    </Box>
  </>
);

const MaxSpendCell = ({ item }: { item: LeaseTemplate }) => (
  <>
    {item.maxSpend ? (
      formatCurrency(item.maxSpend)
    ) : (
      <StatusIndicator type="info">No max budget</StatusIndicator>
    )}
  </>
);

const ExpiryCell = ({ item }: { item: LeaseTemplate }) => (
  <>
    {item.leaseDurationInHours ? (
      `after ${moment.duration(item.leaseDurationInHours, "hours").humanize()}`
    ) : (
      <StatusIndicator type="info">No expiry</StatusIndicator>
    )}
  </>
);

export const LeaseTemplatesTable = () => {
  const intl = useIntl();
  // get lease templates using react query hook
  const {
    data: leaseTemplates,
    isFetching,
    isError,
    refetch,
    error: getError,
  } = useGetLeaseTemplates();

  // selected items state
  const [selectedItems, setSelectedItems] = useState<LeaseTemplate[]>([]);

  // state to show/hide delete modal dialog
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);

  // hook to delete lease templates
  const {
    mutateAsync: deleteLeaseTemplates,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
  } = useDeleteLeaseTemplates();

  // hide error message when displaying modal
  useEffect(() => {
    setShowDeleteError(false);
  }, [isDeleteModalVisible]);

  // show modal error message if error occurred during delete
  useEffect(() => {
    setShowDeleteError(isDeleteError);
  }, [isDeleteError]);

  // delete lease templates using above hook when confirming in modal dialog
  const handleDelete = async () => {
    const selectedIds = selectedItems.map((x) => x.uuid);
    await deleteLeaseTemplates(selectedIds);
    setSelectedItems([]);
    setDeleteModalVisible(false);
    showSuccessToast("Lease template(s) deleted.");
  };

  if (isError) {
    return (
      <ErrorPanel
        retry={refetch}
        description={intl.formatMessage({ id: "leaseTemplate.error.loading", defaultMessage: "Could not load lease templates. Please try again." })}
        error={getError as Error}
      />
    );
  }

  return (
    <>
      <Table
        header={intl.formatMessage({ id: "leaseTemplates.title", defaultMessage: "Lease Templates" })}
        stripedRows
        resizableColumns
        trackBy="uuid"
        loading={isFetching}
        items={leaseTemplates || []}
        totalItemsCount={(leaseTemplates || []).length}
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) =>
          setSelectedItems(detail.selectedItems)
        }
        columnDefinitions={[
          {
            id: "name",
            header: intl.formatMessage({ id: "leaseTemplate.name", defaultMessage: "Name" }),
            sortingField: "name",
            cell: (item: LeaseTemplate) => <NameCell item={item} />,
          },
          {
            id: "createdBy",
            header: intl.formatMessage({ id: "leaseTemplate.createdBy", defaultMessage: "Created by" }),
            sortingField: "createdBy",
            cell: (item: LeaseTemplate) => item.createdBy,
          },
          {
            id: "maxSpend",
            header: intl.formatMessage({ id: "leaseTemplate.maxBudget", defaultMessage: "Max Budget" }),
            sortingField: "maxSpend",
            cell: (item: LeaseTemplate) => <MaxSpendCell item={item} />,
          },
          {
            id: "leaseDurationInHours",
            header: intl.formatMessage({ id: "leaseTemplate.expiry", defaultMessage: "Expiry" }),
            sortingField: "leaseDurationInHours",
            cell: (item: LeaseTemplate) => <ExpiryCell item={item} />,
          },
          {
            id: "meta.lastEditTime",
            header: intl.formatMessage({ id: "leaseTemplate.lastUpdated", defaultMessage: "Last Updated" }),
            sortingField: "meta.lastEditTime",
            cell: (item: LeaseTemplate) =>
              moment(item.meta?.lastEditTime).fromNow(),
          },
        ]}
        actions={
          <SpaceBetween direction="horizontal" size="s">
            <Button
              data-testid="refresh-button"
              iconName="refresh"
              onClick={() => refetch()}
              disabled={isFetching}
            />
            <ButtonDropdown
              disabled={selectedItems.length === 0}
              items={[{ text: intl.formatMessage({ id: "common.delete", defaultMessage: "Delete" }), id: "delete" }]}
              onItemClick={({ detail }) => {
                if (detail.id === "delete") {
                  setDeleteModalVisible(true);
                }
              }}
            >
              {intl.formatMessage({ id: "leaseTemplate.actions", defaultMessage: "Actions" })}
            </ButtonDropdown>
          </SpaceBetween>
        }
      />

      <DeleteConfirmationDialog
        variant="confirmation"
        visible={isDeleteModalVisible}
        title={intl.formatMessage({ id: "leaseTemplate.delete.title", defaultMessage: "Remove lease templates" })}
        onCancelClicked={() => setDeleteModalVisible(false)}
        onDeleteClicked={handleDelete}
        loading={isDeleting}
      >
        <TextContent>
          {intl.formatMessage({ id: "leaseTemplate.delete.confirmation", defaultMessage: "Are you sure you want to remove these lease template(s)?" })}
        </TextContent>

        {showDeleteError && (
          <ErrorPanel
            description={intl.formatMessage({ id: "common.error.generic", defaultMessage: "An error occurred. Please try again." })}
            error={deleteError as Error}
          />
        )}
      </DeleteConfirmationDialog>
    </>
  );
};
