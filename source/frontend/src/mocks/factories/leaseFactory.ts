// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ExpiredLease,
  ExpiredLeaseSchema,
  Lease,
  LeaseSchema,
  MonitoredLease,
  MonitoredLeaseSchema,
  PendingLease,
  PendingLeaseSchema,
} from "@amzn/innovation-sandbox-commons/data/lease/lease.js";
import { generateSchemaData } from "@amzn/innovation-sandbox-commons/test/generate-schema-data";

export function createLease(overrides?: Partial<Lease>): Lease {
  return generateSchemaData(LeaseSchema, {
    owner: {
      type: 'user',
      userEmail: 'test@example.com'
    },
    ...overrides,
  });
}

export function createActiveLease(
  overrides?: Partial<MonitoredLease>,
): MonitoredLease {
  return generateSchemaData(MonitoredLeaseSchema, {
    status: "Active",
    ...overrides,
  });
}

export function createPendingLease(
  overrides?: Partial<PendingLease>,
): PendingLease {
  return generateSchemaData(PendingLeaseSchema, {
    status: "PendingApproval",
    ...overrides,
  });
}

export function createExpiredLease(
  overrides?: Partial<ExpiredLease>,
): ExpiredLease {
  return generateSchemaData(ExpiredLeaseSchema, {
    status: "Expired",
    ...overrides,
  });
}
