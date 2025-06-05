// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Alert,
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { useGetPendingApprovals } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";

export const ApprovalsPanel = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const {
    data: approvals,
    isFetching,
    isError,
    refetch,
    error,
  } = useGetPendingApprovals();

  const body = () => {
    if (isFetching) {
      return (
        <Container>
          <Loader label={intl.formatMessage({ id: "common.loading" })} />
        </Container>
      );
    }

    if (isError || !approvals) {
      return (
        <ErrorPanel
          description={intl.formatMessage({ id: "approvals.error.loading" })}
          retry={refetch}
          error={error as Error}
        />
      );
    }

    if (approvals.length === 0) {
      return (
        <Alert type="success">{intl.formatMessage({ id: "approvals.noPending" })}</Alert>
      );
    }

    return (
      <Alert type="warning" header={intl.formatMessage({ id: "common.pending" })}>
        <Box margin={{ top: "xs" }}>
          {approvals.length === 1 ? (
            intl.formatMessage({ id: "approvals.pending.single" })
          ) : (
            intl.formatMessage(
              { id: "approvals.pending.multiple" },
              { count: approvals.length }
            )
          )}
        </Box>
        <Box margin={{ top: "s" }}>
          <Button onClick={() => navigate("/approvals")}>
            {intl.formatMessage({ id: "approvals.actions.view" })}
          </Button>
        </Box>
      </Alert>
    );
  };

  return (
    <SpaceBetween size="m">
      <Header
        variant="h2"
        actions={
          <Button
            iconName="refresh"
            ariaLabel={intl.formatMessage({ id: "common.refresh" })}
            disabled={isFetching}
            onClick={() => refetch()}
          />
        }
      >
        {intl.formatMessage({ id: "approvals.title" })}
      </Header>
      {body()}
    </SpaceBetween>
  );
};
