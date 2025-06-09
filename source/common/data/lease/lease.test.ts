// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from "vitest";
import { LeaseOwnerSchema, LeaseKeySchema, isUserLease, isTeamLease } from "./lease.js";

describe("Lease Owner", () => {
  it("should validate a user lease owner", () => {
    const userOwner = {
      type: "user" as const,
      userEmail: "user@example.com",
    };
    const result = LeaseOwnerSchema.safeParse(userOwner);
    expect(result.success).toBe(true);
  });

  it("should validate a team lease owner", () => {
    const teamOwner = {
      type: "team" as const,
      teamId: "123e4567-e89b-12d3-a456-426614174000",
    };
    const result = LeaseOwnerSchema.safeParse(teamOwner);
    expect(result.success).toBe(true);
  });

  it("should reject invalid owner types", () => {
    const invalidOwner = {
      type: "invalid",
      id: "123",
    };
    const result = LeaseOwnerSchema.safeParse(invalidOwner);
    expect(result.success).toBe(false);
  });
});

describe("Lease Key", () => {
  it("should validate a lease key with user owner", () => {
    const leaseKey = {
      owner: {
        type: "user" as const,
        userEmail: "user@example.com",
      },
      uuid: "123e4567-e89b-12d3-a456-426614174000",
    };
    const result = LeaseKeySchema.safeParse(leaseKey);
    expect(result.success).toBe(true);
  });

  it("should validate a lease key with team owner", () => {
    const leaseKey = {
      owner: {
        type: "team" as const,
        teamId: "123e4567-e89b-12d3-a456-426614174000",
      },
      uuid: "123e4567-e89b-12d3-a456-426614174000",
    };
    const result = LeaseKeySchema.safeParse(leaseKey);
    expect(result.success).toBe(true);
  });
});

describe("Owner Type Guards", () => {
  it("should correctly identify user leases", () => {
    const userOwner = {
      type: "user" as const,
      userEmail: "user@example.com",
    };
    expect(isUserLease(userOwner)).toBe(true);
    expect(isTeamLease(userOwner)).toBe(false);
  });

  it("should correctly identify team leases", () => {
    const teamOwner = {
      type: "team" as const,
      teamId: "123e4567-e89b-12d3-a456-426614174000",
    };
    expect(isUserLease(teamOwner)).toBe(false);
    expect(isTeamLease(teamOwner)).toBe(true);
  });
});