// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Alert,
  Box,
  Container,
  Link,
  SpaceBetween,
} from "@cloudscape-design/components";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

interface SettingsContainerProps {
  children: ReactNode;
}

export const SettingsContainer = ({ children }: SettingsContainerProps) => {
  return (
    <Box data-top data-settings-form>
      <Container>
        <SpaceBetween size="l">
          <Alert type="info">
            <FormattedMessage id="settings.appConfigNote" />{" "}
            <Link
              external
              href="https://console.aws.amazon.com/systems-manager/appconfig/applications"
            >
              AWS AppConfig
            </Link>
          </Alert>
          <Box>{children}</Box>
        </SpaceBetween>
      </Container>
    </Box>
  );
};
