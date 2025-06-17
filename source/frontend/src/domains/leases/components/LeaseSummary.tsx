// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  ColumnLayout,
  Container,
  CopyToClipboard,
  FormField,
  Header,
  Popover,
  SpaceBetween,
  StatusIndicator,
} from "@cloudscape-design/components";
import { useIntl } from 'react-intl';

import {
  isExpiredLease,
  isMonitoredLease,
  isPendingLease,
  Lease,
} from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { BudgetProgressBar } from "@amzn/innovation-sandbox-frontend/components/BudgetProgressBar";
import { BudgetStatus } from "@amzn/innovation-sandbox-frontend/components/BudgetStatus";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { LeaseStatusBadge } from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseStatusBadge";
import moment from "moment";

export const LeaseSummary = ({ lease }: { lease: Lease }) => {
  const isPending = isPendingLease(lease);
  const isMonitored = isMonitoredLease(lease);
  const isExpired = isExpiredLease(lease);
  const isMonitoredOrExpired = isMonitored || isExpired;

  const renderTimePopover = (date: string) => (
    <Popover
      position="top"
      size="large"
      dismissButton={false}
      content={moment(date).format("lll")}
    >
      <Box>{moment(date).fromNow()}</Box>
    </Popover>
  );

  const intl = useIntl();

  return (
    <Container header={<Header>{intl.formatMessage({ id: "lease.summary.title" })}</Header>}>
      <ColumnLayout columns={2}>
        <SpaceBetween size="l">
          <Box>
            <FormField label={intl.formatMessage({ id: "lease.summary.leaseId" })} />
            <CopyToClipboard
              variant="inline"
              textToCopy={lease.uuid}
              copySuccessText={intl.formatMessage({ id: "lease.summary.copyLeaseId.success" })}
              copyErrorText={intl.formatMessage({ id: "lease.summary.copyLeaseId.error" })}
            />
          </Box>
          <Box>
            <FormField label={intl.formatMessage({ id: "lease.summary.accountId" })} />
            {isMonitoredOrExpired ? (
              <CopyToClipboard
                variant="inline"
                textToCopy={lease.awsAccountId}
                copySuccessText={intl.formatMessage({ id: "lease.summary.copyAccountId.success" })}
                copyErrorText={intl.formatMessage({ id: "lease.summary.copyAccountId.error" })}
              />
            ) : (
              <StatusIndicator type="warning">
                {intl.formatMessage({ id: "lease.summary.noAccount" })}
              </StatusIndicator>
            )}
          </Box>
          <Box>
            <FormField label={intl.formatMessage({ id: "lease.summary.template" })} />
            <Box>{lease.originalLeaseTemplateName}</Box>
          </Box>
          <Box>
            <FormField label={intl.formatMessage({ id: "lease.summary.requestedBy" })} />
            <Box>{lease.userEmail}</Box>
          </Box>
          {isMonitoredOrExpired && (
            <Box>
              <FormField label={intl.formatMessage({ id: "lease.summary.approvedBy" })} />
              <Box>
                {lease.approvedBy === "AUTO_APPROVED" ? (
                  <StatusIndicator type="success">
                    {intl.formatMessage({ id: "lease.summary.autoApproved" })}
                  </StatusIndicator>
                ) : (
                  lease.approvedBy
                )}
              </Box>
            </Box>
          )}
          <Box>
            <FormField label={intl.formatMessage({ id: "common.status" })} />
            <Box>
              <LeaseStatusBadge lease={lease} />
            </Box>
          </Box>
        </SpaceBetween>
        <SpaceBetween size="l">
          <Box>
            <FormField label={isPending ? 
              intl.formatMessage({ id: "lease.summary.maxBudget" }) : 
              intl.formatMessage({ id: "lease.summary.budgetStatus" })} />
            {isPending ? (
              <BudgetStatus maxSpend={lease.maxSpend} />
            ) : (
              <BudgetProgressBar
                currentValue={
                  !isMonitoredOrExpired ? 0 : lease.totalCostAccrued
                }
                maxValue={lease.maxSpend}
              />
            )}
          </Box>

          {isMonitoredOrExpired && (
            <Box>
              <FormField label={intl.formatMessage({ id: "lease.summary.started" })} />
              {renderTimePopover(lease.startDate)}
            </Box>
          )}

          <Box>
            <FormField label={intl.formatMessage({ id: "lease.summary.expiry" })} />
            <DurationStatus
              date={isMonitoredOrExpired ? lease.expirationDate : undefined}
              durationInHours={lease.leaseDurationInHours}
            />
          </Box>

          {isMonitoredOrExpired && (
            <Box>
              <FormField label={intl.formatMessage({ id: "lease.summary.lastMonitored" })} />
              {renderTimePopover(lease.lastCheckedDate)}
            </Box>
          )}

          <Box>
            <FormField label={intl.formatMessage({ id: "lease.summary.comments" })} />
            {lease.comments ? (
              lease.comments
            ) : (
              <StatusIndicator type="info">
                {intl.formatMessage({ id: "lease.summary.noComments" })}
              </StatusIndicator>
            )}
          </Box>
        </SpaceBetween>
      </ColumnLayout>
    </Container>
  );
};
