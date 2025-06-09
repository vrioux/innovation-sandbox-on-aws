// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Team, TeamKey } from "./team.js";
import { TeamStore } from "./team-store.js";

export class DynamoTeamStore implements TeamStore {
  private readonly documentClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(dynamoClient: DynamoDBClient, tableName: string) {
    this.documentClient = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = tableName;
  }

  async createTeam(team: Team): Promise<Team> {
    await this.documentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: team,
        ConditionExpression: "attribute_not_exists(teamId)",
      }),
    );
    return team;
  }

  async getTeam(key: TeamKey): Promise<Team> {
    const response = await this.documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: key,
      }),
    );
    if (!response.Item) {
      throw new Error(`Team not found: ${key.teamId}`);
    }
    return response.Item as Team;
  }

  async updateTeam(team: Team): Promise<Team> {
    await this.documentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: team,
        ConditionExpression: "attribute_exists(teamId)",
      }),
    );
    return team;
  }

  async deleteTeam(key: TeamKey): Promise<void> {
    await this.documentClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: key,
      }),
    );
  }

  async listTeams(): Promise<Team[]> {
    const response = await this.documentClient.send(
      new ScanCommand({
        TableName: this.tableName,
      }),
    );
    return (response.Items || []) as Team[];
  }

  async listTeamsByMember(userEmail: string): Promise<Team[]> {
    const response = await this.documentClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "contains(members, :userEmail)",
        ExpressionAttributeValues: {
          ":userEmail": userEmail,
        },
      }),
    );
    return (response.Items || []) as Team[];
  }
}