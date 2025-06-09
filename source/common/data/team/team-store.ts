// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Team, TeamKey } from "./team.js";

export interface TeamStore {
  createTeam(team: Team): Promise<Team>;
  getTeam(key: TeamKey): Promise<Team>;
  updateTeam(team: Team): Promise<Team>;
  deleteTeam(key: TeamKey): Promise<void>;
  listTeams(): Promise<Team[]>;
  listTeamsByMember(userEmail: string): Promise<Team[]>;
}