// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { z } from "zod";

import {
  AwsAccountIdSchema,
  FreeTextSchema,
} from "@amzn/innovation-sandbox-commons/data/common-schemas.js";
import {
  DurationConfigSchema,
  LeaseTemplateSchema,
} from "@amzn/innovation-sandbox-commons/data/lease-template/lease-template.js";
import { ItemWithMetadataSchema } from "@amzn/innovation-sandbox-commons/data/metadata.js";

// IMPORTANT -- this value must be updated whenever the schema changes.
export const LeaseSchemaVersion = 1;

/*
Leases pass through 3 general stages of their lifecycle: Pending, Active, and Expired. A lease will end either
by being denied in the pending stage, or by reaching one of the terminal states defined by the Expired schema
 */

// Leases that have been requested but yet to be approved or denied
export const PendingLeaseStatusSchema = z.literal("PendingApproval");

// Leases whose request has been denied
export const ApprovalDeniedLeaseStatusSchema = z.literal("ApprovalDenied");

// Leases that are active and are being monitored
export const MonitoredLeaseStatusSchema = z.enum(["Active", "Frozen"]);

// Leases that are no longer active (terminal, no more actions should occur on these leases)
export const ExpiredLeaseStatusSchema = z.enum([
  "Expired",
  "BudgetExceeded",
  "ManuallyTerminated",
  "AccountQuarantined",
  "Ejected",
]);

export const AllLeaseStatusSchema = z.enum([
  PendingLeaseStatusSchema.value,
  ApprovalDeniedLeaseStatusSchema.value,
  ...MonitoredLeaseStatusSchema.options,
  ...ExpiredLeaseStatusSchema.options,
]);

export const LeaseOwnerSchema = z.union([
  z.object({
    type: z.literal('user'),
    userEmail: z.string().email(),
  }),
  z.object({
    type: z.literal('team'),
    teamId: z.string().uuid(),
  }),
]);

export const LeaseKeySchema = z.object({
  owner: LeaseOwnerSchema,
  uuid: z.string().uuid(),
});

export const PendingLeaseSchema = LeaseKeySchema.extend({
  status: PendingLeaseStatusSchema,
  originalLeaseTemplateUuid: LeaseTemplateSchema.shape.uuid,
  originalLeaseTemplateName: LeaseTemplateSchema.shape.name,
  leaseDurationInHours: DurationConfigSchema.shape.leaseDurationInHours,
  comments: FreeTextSchema.optional(),
}).merge(
  LeaseTemplateSchema.pick({
    maxSpend: true,
    budgetThresholds: true,
    durationThresholds: true,
  }).merge(ItemWithMetadataSchema),
);

// TTL attribute for DynamoDB automatic deletion (Unix timestamp in seconds)
export const TtlSchema = z.number().int().nonnegative();

export const ApprovalDeniedLeaseSchema = PendingLeaseSchema.extend({
  //overrides
  status: ApprovalDeniedLeaseStatusSchema,
  //extra values
  ttl: TtlSchema,
});

export const ApprovedBySchema = z.union([
  z.string().email(),
  z.literal("AUTO_APPROVED"),
]);

export const MonitoredLeaseSchema = PendingLeaseSchema.extend({
  //overrides
  status: MonitoredLeaseStatusSchema,
  //extra values
  awsAccountId: AwsAccountIdSchema,
  approvedBy: ApprovedBySchema,
  startDate: z.string().datetime(), // ISO 8601 -- https://zod.dev/?id=datetimes
  expirationDate: z.string().datetime().optional(), // ISO 8601 -- https://zod.dev/?id=datetimes
  lastCheckedDate: z.string().datetime(), // ISO 8601 -- https://zod.dev/?id=datetimes
  totalCostAccrued: z.number(),
});

export const ExpiredLeaseSchema = MonitoredLeaseSchema.extend({
  //overrides
  status: ExpiredLeaseStatusSchema,
  //extra values
  endDate: z.string().datetime(),
  ttl: TtlSchema,
});

export const LeaseSchema = z.discriminatedUnion("status", [
  PendingLeaseSchema,
  ApprovalDeniedLeaseSchema,
  MonitoredLeaseSchema,
  ExpiredLeaseSchema,
]);

export type LeaseStatus = z.infer<typeof AllLeaseStatusSchema>;
export type PendingLeaseStatus = z.infer<typeof PendingLeaseStatusSchema>;
export type ApprovalDeniedLeaseStatus = z.infer<
  typeof ApprovalDeniedLeaseStatusSchema
>;
export type MonitoredLeaseStatus = z.infer<typeof MonitoredLeaseStatusSchema>;
export type ExpiredLeaseStatus = z.infer<typeof ExpiredLeaseStatusSchema>;

export type Lease = z.infer<typeof LeaseSchema>;
export type PendingLease = z.infer<typeof PendingLeaseSchema>;
export type ApprovalDeniedLease = z.infer<typeof ApprovalDeniedLeaseSchema>;
export type MonitoredLease = z.infer<typeof MonitoredLeaseSchema>;
export type ExpiredLease = z.infer<typeof ExpiredLeaseSchema>;
export type LeaseWithLeaseId = Lease & { leaseId: string };

export type LeaseKey = z.infer<typeof LeaseKeySchema>;
export type LeaseOwner = z.infer<typeof LeaseOwnerSchema>;

export function isUserLease(owner: LeaseOwner): owner is { type: 'user'; userEmail: string } {
  return owner.type === 'user';
}

export function isTeamLease(owner: LeaseOwner): owner is { type: 'team'; teamId: string } {
  return owner.type === 'team';
}

export function isPendingLease(lease: Lease): lease is PendingLease {
  return PendingLeaseStatusSchema.safeParse(lease.status).success;
}

export function isApprovalDeniedLease(
  lease: Lease,
): lease is ApprovalDeniedLease {
  return ApprovalDeniedLeaseStatusSchema.safeParse(lease.status).success;
}

export function isMonitoredLease(lease: Lease): lease is MonitoredLease {
  return MonitoredLeaseStatusSchema.safeParse(lease.status).success;
}

export function isActiveLease(lease: Lease): lease is MonitoredLease {
  return lease.status === "Active";
}

export function isExpiredLease(lease: Lease): lease is ExpiredLease {
  return ExpiredLeaseStatusSchema.safeParse(lease.status).success;
}
