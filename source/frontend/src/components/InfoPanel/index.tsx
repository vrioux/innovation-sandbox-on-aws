// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Button } from "@cloudscape-design/components";
import { useIntl } from "react-intl";

interface InfoPanelProps {
  header: string;
  type?: "info" | "warning";
  description?: string;
  actionLabel?: string;
  action?: () => void;
}

export const InfoPanel = ({
  header,
  type = "info",
  description,
  actionLabel,
  action,
}: InfoPanelProps) => {
  const intl = useIntl();
  return (
    <Alert type={type} header={header}>
      {description && <Box margin={{ top: "xs" }}>{description}</Box>}
      {action && (
        <Box margin={{ top: "s" }}>
          <Button onClick={() => action()}>
            {actionLabel ?? intl.formatMessage({ id: "common.ok" })}
          </Button>
        </Box>
      )}
    </Alert>
  );
};
