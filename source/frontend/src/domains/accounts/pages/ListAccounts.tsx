// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Table } from "@aws-northstar/ui";
import {
  Button,
  ButtonDropdown,
  Container,
  ContentLayout,
  Header,
  Popover,
  SpaceBetween,
} from "@cloudscape-design/components";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";

import {
  SandboxAccount,
  SandboxAccountStatus,
} from "@amzn/innovation-sandbox-commons/data/sandbox-account/sandbox-account";
import { AccountLoginLink } from "@amzn/innovation-sandbox-frontend/components/AccountLoginLink";
import { AccountsSummary } from "@amzn/innovation-sandbox-frontend/components/AccountsSummary";
import { Markdown } from "@amzn/innovation-sandbox-frontend/components/Markdown";
import { BatchActionReview } from "@amzn/innovation-sandbox-frontend/components/MultiSelectTableActionReview";
import {
  showErrorToast,
  showSuccessToast,
} from "@amzn/innovation-sandbox-frontend/components/Toast";
import { AccountStatusIndicator } from "@amzn/innovation-sandbox-frontend/domains/accounts/components/AccountStatusIndicator";
import { accountStatusSortingComparator } from "@amzn/innovation-sandbox-frontend/domains/accounts/helpers";
import {
  useCleanupAccount,
  useEjectAccount,
  useGetAccounts,
} from "@amzn/innovation-sandbox-frontend/domains/accounts/hooks";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";
import { useModal } from "@amzn/innovation-sandbox-frontend/hooks/useModal";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

const StatusCell = ({ account }: { account: SandboxAccount }) => (
  <AccountStatusIndicator
    status={account.status}
    lastCleanupStartTime={
      account.cleanupExecutionContext?.stateMachineExecutionStartTime!
    }
  />
);

const CreatedOnCell = ({ account }: { account: SandboxAccount }) => (
  <Popover
    position="top"
    dismissButton={false}
    content={moment(account.meta?.createdTime).format("MM/DD/YYYY hh:mm:A")}
  >
    {moment(account.meta?.createdTime).fromNow()}
  </Popover>
);

const LastModifiedCell = ({ account }: { account: SandboxAccount }) => (
  <Popover
    position="top"
    dismissButton={false}
    content={moment(account.meta?.lastEditTime).format("MM/DD/YYYY hh:mm:A")}
  >
    {moment(account.meta?.lastEditTime).fromNow()}
  </Popover>
);

const AccessCell = ({ account }: { account: SandboxAccount }) => (
  <AccountLoginLink accountId={account.awsAccountId} />
);

const createColumnDefinitions = (includeLinks: boolean, intl: ReturnType<typeof useIntl>) =>
  [
    {
      id: "awsAccountId",
      header: intl.formatMessage({ id: "accounts.table.accountId" }),
      sortingField: "awsAccountId",
      cell: (account: SandboxAccount) => account.awsAccountId,
    },
    {
      id: "status",
      header: intl.formatMessage({ id: "accounts.table.status" }),
      sortingComparator: accountStatusSortingComparator,
      cell: (account: SandboxAccount) => <StatusCell account={account} />,
    },
    {
      id: "createdOn",
      header: intl.formatMessage({ id: "accounts.table.added" }),
      sortingField: "createdOn",
      cell: (account: SandboxAccount) => <CreatedOnCell account={account} />,
    },
    {
      id: "lastModifiedOn",
      header: intl.formatMessage({ id: "accounts.table.lastModified" }),
      sortingField: "lastModifiedOn",
      cell: (account: SandboxAccount) => <LastModifiedCell account={account} />,
    },
    {
      id: "name",
      header: intl.formatMessage({ id: "accounts.table.name" }),
      cell: (account: SandboxAccount) => account.name ?? "N/A",
    },
    {
      id: "email",
      header: intl.formatMessage({ id: "accounts.table.email" }),
      cell: (account: SandboxAccount) => account.email ?? "N/A",
    },
    {
      id: "link",
      header: intl.formatMessage({ id: "accounts.table.access" }),
      cell: (account: SandboxAccount) => <AccessCell account={account} />,
    },
  ].filter((column) => includeLinks || column.id !== "link");

type EjectModalProps = {
  selectedAccounts: SandboxAccount[];
  ejectAccount: (accountId: string) => Promise<any>;
  navigate: (path: string) => void;
};

const EjectModalContent = ({
  selectedAccounts,
  ejectAccount,
  navigate,
}: EjectModalProps) => {
  const intl = useIntl();
  return (
    <BatchActionReview
      items={selectedAccounts}
      description={intl.formatMessage(
        { id: "accounts.modal.eject.description" },
        { count: selectedAccounts.length }
      )}
      columnDefinitions={createColumnDefinitions(false, intl)}
      identifierKey="awsAccountId"
      onSubmit={async (account: SandboxAccount) => {
        await ejectAccount(account.awsAccountId);
      }}
      onSuccess={() => {
        navigate("/accounts");
        showSuccessToast(
          intl.formatMessage({ id: "accounts.modal.eject.success" })
        );
      }}
      onError={() =>
        showErrorToast(
          intl.formatMessage({ id: "accounts.modal.eject.error" }),
          intl.formatMessage({ id: "accounts.modal.eject.error.title" })
        )
      }
    />
  );
};

type CleanupModalProps = {
  selectedAccounts: SandboxAccount[];
  cleanupAccount: (accountId: string) => Promise<any>;
  navigate: (path: string) => void;
};

const CleanupModalContent = ({
  selectedAccounts,
  cleanupAccount,
  navigate,
}: CleanupModalProps) => {
  const intl = useIntl();
  return (
    <BatchActionReview
      items={selectedAccounts}
      description={intl.formatMessage(
        { id: "accounts.modal.cleanup.description" },
        { count: selectedAccounts.length }
      )}
      columnDefinitions={createColumnDefinitions(false, intl)}
      identifierKey="awsAccountId"
      onSubmit={async (account: SandboxAccount) => {
        await cleanupAccount(account.awsAccountId);
      }}
      onSuccess={() => {
        navigate("/accounts");
        showSuccessToast(
          intl.formatMessage({ id: "accounts.modal.cleanup.success" })
        );
      }}
      onError={() =>
        showErrorToast(
          intl.formatMessage({ id: "accounts.modal.cleanup.error" }),
          intl.formatMessage({ id: "accounts.modal.cleanup.error.title" })
        )
      }
    />
  );
};

export const ListAccounts = () => {
  // base ui hooks
  const navigate = useNavigate();
  const setBreadcrumb = useBreadcrumb();
  const { setTools } = useAppLayoutContext();
  const intl = useIntl();

  // modal hook
  const { showModal } = useModal();

  // api hooks
  const { data: accounts, isFetching, refetch } = useGetAccounts();
  const { mutateAsync: ejectAccount } = useEjectAccount();
  const { mutateAsync: cleanupAccount } = useCleanupAccount();

  // state
  const [filter, setFilter] = useState<SandboxAccountStatus>();
  const [selectedAccounts, setSelectedAccounts] = useState<SandboxAccount[]>(
    [],
  );
  const [filteredAccounts, setFilteredAccounts] = useState<SandboxAccount[]>(
    [],
  );

  useInit(async () => {
    setBreadcrumb([
      { text: intl.formatMessage({ id: "common.home" }), href: "/" },
      { text: intl.formatMessage({ id: "accounts.title" }), href: "/accounts" },
    ]);
    setTools(<Markdown file="accounts" />);
  });

  const onCreateClick = () => {
    navigate("/accounts/new");
  };

  useEffect(() => {
    if (!accounts) return;

    filter
      ? setFilteredAccounts(accounts.filter((x) => filter === x.status))
      : setFilteredAccounts(accounts);
  }, [accounts, filter]);

  const showEjectModal = () => {
    showModal({
      header: intl.formatMessage({ id: "accounts.modal.eject.title" }),
      content: (
        <EjectModalContent
          selectedAccounts={selectedAccounts}
          ejectAccount={ejectAccount}
          navigate={navigate}
        />
      ),
      size: "max",
    });
  };

  const showCleanupModal = () => {
    showModal({
      header: intl.formatMessage({ id: "accounts.modal.cleanup.title" }),
      content: (
        <CleanupModalContent
          selectedAccounts={selectedAccounts}
          cleanupAccount={cleanupAccount}
          navigate={navigate}
        />
      ),
      size: "max",
    });
  };

  const handleSelectionChange = ({ detail }: any) => {
    const accounts = detail.selectedItems as SandboxAccount[];
    setSelectedAccounts(accounts);
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <Button onClick={onCreateClick} variant="primary">
              {intl.formatMessage({ id: "accounts.addButton" })}
            </Button>
          }
          description={intl.formatMessage({ id: "accounts.description" })}
        >
          {intl.formatMessage({ id: "accounts.title" })}
        </Header>
      }
    >
      <SpaceBetween size="m">
        <AccountsSummary
          isLoading={isFetching}
          accounts={accounts}
          filter={filter}
          onFilterUpdated={setFilter}
        />
        <Container>
          <Table
            data-embedded-table
            variant="embedded"
            stripedRows
            trackBy="awsAccountId"
            columnDefinitions={createColumnDefinitions(true, intl)}
            header={intl.formatMessage({ id: "accounts.table.header" })}
            items={filteredAccounts}
            selectedItems={selectedAccounts}
            onSelectionChange={handleSelectionChange}
            loading={isFetching}
            actions={
              <SpaceBetween direction="horizontal" size="s">
                <Button
                  iconName="refresh"
                  data-testid="refresh-button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                />
                <ButtonDropdown
                  disabled={selectedAccounts.length === 0}
                  items={[
                    { 
                      text: intl.formatMessage({ id: "accounts.actions.eject" }), 
                      id: "eject" 
                    },
                    {
                      text: intl.formatMessage({ id: "accounts.actions.retryCleanup" }),
                      id: "retryCleanup",
                      disabled:
                        // disable cleanup option unless all selected accounts are in quarantine or cleanup
                        !selectedAccounts.every(
                          (x) =>
                            x.status === "Quarantine" || x.status === "CleanUp",
                        ),
                    },
                  ]}
                  onItemClick={({ detail }) => {
                    switch (detail.id) {
                      case "eject":
                        showEjectModal();
                        break;
                      case "retryCleanup":
                        showCleanupModal();
                        break;
                    }
                  }}
                >
                  {intl.formatMessage({ id: "accounts.actions" })}
                </ButtonDropdown>
              </SpaceBetween>
            }
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
};
