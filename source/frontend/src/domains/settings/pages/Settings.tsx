// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ContentLayout, Header, Tabs } from "@cloudscape-design/components";
import { FormattedMessage, useIntl } from "react-intl";

import { InfoLink } from "@amzn/innovation-sandbox-frontend/components/InfoLink";
import { Markdown } from "@amzn/innovation-sandbox-frontend/components/Markdown";
import { CleanupSettings } from "@amzn/innovation-sandbox-frontend/domains/settings/components/CleanupSettings";
import { GeneralSettings } from "@amzn/innovation-sandbox-frontend/domains/settings/components/GeneralSettings";
import { LeaseSettings } from "@amzn/innovation-sandbox-frontend/domains/settings/components/LeaseSettings";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

export const Settings = () => {
  const setBreadcrumb = useBreadcrumb();
  const { setTools } = useAppLayoutContext();
  const intl = useIntl();

  useInit(() => {
    setBreadcrumb([
      { text: intl.formatMessage({ id: "common.home" }), href: "/" },
      { text: intl.formatMessage({ id: "settings.title" }), href: "/settings" },
    ]);
    setTools(<Markdown file="settings" />);
  });

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          info={<InfoLink markdown="settings" />}
          description={<FormattedMessage id="settings.description" />}
        >
          <FormattedMessage id="settings.title" />
        </Header>
      }
    >
      <Tabs
        tabs={[
          {
            label: intl.formatMessage({ id: "settings.general" }),
            id: "general",
            content: <GeneralSettings />,
          },
          {
            label: intl.formatMessage({ id: "settings.lease" }),
            id: "lease",
            content: <LeaseSettings />,
          },
          {
            label: intl.formatMessage({ id: "settings.cleanup" }),
            id: "clean",
            content: <CleanupSettings />,
          },
        ]}
      />
    </ContentLayout>
  );
};
