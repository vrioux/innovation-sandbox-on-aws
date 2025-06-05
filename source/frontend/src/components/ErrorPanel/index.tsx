// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Button } from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";

interface ErrorPanelProps {
  header?: string;
  description?: string;
  retry?: () => void;
  error?: Error;
}

export const ErrorPanel = ({
  header,
  description,
  retry,
  error,
}: ErrorPanelProps) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const reLogin = () => {
    navigate(0);
  };
  const sessionExpiredAlert = (
    <Alert type="error" header={intl.formatMessage({ id: "error.sessionExpired" })}>
      {description && <Box margin={{ top: "xs" }}>{description}</Box>}
      <Box margin={{ top: "s" }}>
        <Button iconName="refresh" onClick={reLogin}>
          {intl.formatMessage({ id: "error.loginAgain" })}
        </Button>
      </Box>
    </Alert>
  );
  const errorAlert = (
    <Alert type="error" header={header || intl.formatMessage({ id: "error.defaultHeader" })}>
      {description && <Box margin={{ top: "xs" }}>{description}</Box>}
      {retry && (
        <Box margin={{ top: "s" }}>
          <Button iconName="refresh" onClick={() => retry()}>
            {intl.formatMessage({ id: "error.tryAgain" })}
          </Button>
        </Box>
      )}
    </Alert>
  );
  if (error && error.toString().includes("403")) {
    return sessionExpiredAlert;
  } else {
    return errorAlert;
  }
};
