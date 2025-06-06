// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AppLayoutBase from "@aws-northstar/ui/components/AppLayout";
import { BreadcrumbGroup } from "@cloudscape-design/components";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { IsbUser } from "@amzn/innovation-sandbox-commons/types/isb-types";
import logo from "@amzn/innovation-sandbox-frontend/assets/images/logo.png";
import { useAppContext } from "@amzn/innovation-sandbox-frontend/components/AppContext/context";
import { AppLayoutProps } from "@amzn/innovation-sandbox-frontend/components/AppLayout";
import { useNavigationItems } from "@amzn/innovation-sandbox-frontend/components/AppLayout/constants";
import { NavHeader } from "@amzn/innovation-sandbox-frontend/components/AppLayout/NavHeader";
import { FullPageLoader } from "@amzn/innovation-sandbox-frontend/components/FullPageLoader";
import { MaintenanceBanner } from "@amzn/innovation-sandbox-frontend/components/MaintenanceBanner";
import { AuthService } from "@amzn/innovation-sandbox-frontend/helpers/AuthService";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/hooks/useTranslation";

export const BaseLayout = ({ children }: AppLayoutProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { breadcrumb } = useAppContext();
  const [user, setUser] = useState<IsbUser | undefined>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { t } = useTranslation();

  const onExit = () => {
    setIsLoggingOut(true);
    queryClient.clear();
    AuthService.logout();
  };

  useInit(async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
  });

  const navigationItems = useMemo(() => {
    const { commonNavItems, userNavItems, managerNavItems, adminNavItems } = useNavigationItems();
    
    if (user?.roles?.includes("Admin")) {
      return [...adminNavItems, ...commonNavItems];
    }

    if (user?.roles?.includes("Manager")) {
      return [...managerNavItems, ...commonNavItems];
    }

    return [...userNavItems, ...commonNavItems];
  }, [user?.roles, t]);

  if (isLoggingOut) {
    return <FullPageLoader label={t("common.signingOut", "Signing out...")} />;
  }

  const appTitle = t("app.title", "Innovation Sandbox on AWS");

  return (
    <AppLayoutBase
      headerSelector="#app-header"
      header={
        <NavHeader
          title={appTitle}
          logo={logo}
          user={user}
          onExit={onExit}
        />
      }
      title={appTitle}
      navigationItems={navigationItems}
      navigationOpen={window.innerWidth > 688}
      breadcrumbGroup={
        <BreadcrumbGroup
          items={breadcrumb}
          onClick={(e) => {
            e.preventDefault();
            navigate(e.detail.item.href);
          }}
        />
      }
    >
      <MaintenanceBanner />
      {children}
    </AppLayoutBase>
  );
};
