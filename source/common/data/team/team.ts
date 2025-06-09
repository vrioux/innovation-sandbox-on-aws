// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { z } from "zod";
import { ItemWithMetadataSchema } from "@amzn/innovation-sandbox-commons/data/metadata.js";

export const TeamSchema = z.object({
  teamId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  members: z.array(z.string().email()),
  teamOwner: z.string().email(),
}).merge(ItemWithMetadataSchema);

export type Team = z.infer<typeof TeamSchema>;

export const TeamKeySchema = z.object({
  teamId: z.string().uuid(),
});

export type TeamKey = z.infer<typeof TeamKeySchema>;