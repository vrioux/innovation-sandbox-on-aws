// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  Button,
  Container,
  SpaceBetween,
  StatusIndicator,
} from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import styles from "@amzn/innovation-sandbox-frontend/components/AccountsSummary/styles.module.scss";
import Animate from "@amzn/innovation-sandbox-frontend/components/Animate";

export const NoAccounts = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.middle}>
          <Animate>
            <SpaceBetween size="m" alignItems="center">
              <StatusIndicator type="warning">
                <FormattedMessage id="accounts.noAccounts" />
              </StatusIndicator>
              <Box>
                <FormattedMessage id="accounts.startAdding" />
              </Box>
              <Button onClick={() => navigate("/accounts/new")}>
                <FormattedMessage id="accounts.addButton" />
              </Button>
            </SpaceBetween>
          </Animate>
        </div>
      </div>
    </Container>
  );
};
