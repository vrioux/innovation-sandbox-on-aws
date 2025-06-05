// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";
import { Alert, Box, Link } from "@cloudscape-design/components";
import { useIntl } from "react-intl";

export const MaintenanceBanner = () => {
  const { data: config } = useGetConfigurations();
  const intl = useIntl();

  if (config?.maintenanceMode) {
    return (
      <Box margin={{ bottom: "l" }}>
        <Alert type="warning" header={intl.formatMessage({ id: "maintenance.header" })} dismissible={false}>
          {intl.formatMessage({ id: "maintenance.message" })}{" "}
          <Link
            external
            href="https://console.aws.amazon.com/systems-manager/appconfig/applications"
          >
            {intl.formatMessage({ id: "maintenance.appConfigLink" })}
          </Link>
          .
        </Alert>
      </Box>
    );
  }
};
