// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from "vitest";
import { Team, TeamSchema } from "./team.js";

describe("Team", () => {
  const validTeam: Team = {
    teamId: "123e4567-e89b-12d3-a456-426614174000",
    name: "Test Team",
    description: "A test team",
    members: ["user1@example.com", "user2@example.com"],
    teamOwner: "owner@example.com",
    createdBy: "creator@example.com",
    createdDate: new Date().toISOString(),
    lastModifiedBy: "modifier@example.com",
    lastModifiedDate: new Date().toISOString(),
  };

  it("should validate a valid team", () => {
    const result = TeamSchema.safeParse(validTeam);
    expect(result.success).toBe(true);
  });

  it("should reject a team with invalid email addresses", () => {
    const invalidTeam = {
      ...validTeam,
      members: ["not-an-email", "also-not-an-email"],
    };
    const result = TeamSchema.safeParse(invalidTeam);
    expect(result.success).toBe(false);
  });

  it("should reject a team with invalid UUID", () => {
    const invalidTeam = {
      ...validTeam,
      teamId: "not-a-uuid",
    };
    const result = TeamSchema.safeParse(invalidTeam);
    expect(result.success).toBe(false);
  });

  it("should allow a team without description", () => {
    const teamWithoutDescription = { ...validTeam };
    delete teamWithoutDescription.description;
    const result = TeamSchema.safeParse(teamWithoutDescription);
    expect(result.success).toBe(true);
  });
});