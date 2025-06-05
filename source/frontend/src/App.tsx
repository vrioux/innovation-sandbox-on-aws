// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Import npm css
import "react-toastify/dist/ReactToastify.css";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify/unstyled";

import { AppLayout } from "@amzn/innovation-sandbox-frontend/components/AppLayout";
import { Authenticator } from "@amzn/innovation-sandbox-frontend/components/Authenticator";
import { IntlProvider } from "@amzn/innovation-sandbox-frontend/i18n/IntlProvider";
import { AddAccounts } from "@amzn/innovation-sandbox-frontend/domains/accounts/pages/AddAccounts";
import { ListAccounts } from "@amzn/innovation-sandbox-frontend/domains/accounts/pages/ListAccounts";
import { Home } from "@amzn/innovation-sandbox-frontend/domains/home/pages/Home";
import { ApprovalDetails } from "@amzn/innovation-sandbox-frontend/domains/leases/pages/ApprovalDetails";
import { ListApprovals } from "@amzn/innovation-sandbox-frontend/domains/leases/pages/ListApprovals";
import { ListLeases } from "@amzn/innovation-sandbox-frontend/domains/leases/pages/ListLeases";
import { RequestLease } from "@amzn/innovation-sandbox-frontend/domains/leases/pages/RequestLease";
import { UpdateLease } from "@amzn/innovation-sandbox-frontend/domains/leases/pages/UpdateLease";
import { AddLeaseTemplate } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/pages/AddLeaseTemplate";
import { ListLeaseTemplates } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/pages/ListLeaseTemplates";
import { UpdateLeaseTemplate } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/pages/UpdateLeaseTemplate";
import { Settings } from "@amzn/innovation-sandbox-frontend/domains/settings/pages/Settings";
import { ModalProvider } from "@amzn/innovation-sandbox-frontend/hooks/useModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Import local css
import "./assets/styles/app.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  },
});

const routes = [
  { path: "/", Element: Home },
  { path: "/request", Element: RequestLease },
  { path: "/settings", Element: Settings },
  { path: "/lease_templates", Element: ListLeaseTemplates },
  { path: "/lease_templates/new", Element: AddLeaseTemplate },
  { path: "/lease_templates/edit/:uuid", Element: UpdateLeaseTemplate },
  { path: "/accounts", Element: ListAccounts },
  { path: "/accounts/new", Element: AddAccounts },
  { path: "/approvals", Element: ListApprovals },
  { path: "/approvals/:leaseId", Element: ApprovalDetails },
  { path: "/leases", Element: ListLeases },
  { path: "/leases/edit/:leaseId", Element: UpdateLease },
];

export const App = () => {
  return (
    <IntlProvider>
      <Authenticator>
        <QueryClientProvider client={queryClient}>
          <Router>
            <ModalProvider>
              <AppLayout>
                <Routes>
                  {routes.map(({ path, Element }) => (
                    <Route key={path} path={path} element={<Element />} />
                  ))}
                </Routes>
              </AppLayout>
            </ModalProvider>
          </Router>
          <ToastContainer />
        </QueryClientProvider>
      </Authenticator>
    </IntlProvider>
  );
};