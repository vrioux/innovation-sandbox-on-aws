// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StatusIndicator } from "@cloudscape-design/components";
import { useIntl } from "react-intl";

import { formatCurrency } from "@amzn/innovation-sandbox-frontend/helpers/util";

import styles from "./styles.module.scss";

interface BudgetProgressBarProps {
  currentValue: number;
  maxValue?: number;
}

export const BudgetProgressBar = ({
  currentValue,
  maxValue,
}: BudgetProgressBarProps) => {
  const intl = useIntl();
  return (
    <>
      {maxValue && (
        <div className={styles.container}>
          <div className={styles.bar}>
            <div
              className={styles.progress}
              style={{ width: `${(currentValue / maxValue) * 100}%` }}
            />
          </div>
          <div className={styles.label}>${maxValue}</div>
        </div>
      )}
      {!maxValue && (
        <StatusIndicator data-small type="warning">
          {intl.formatMessage({ id: "budget.noMaxBudget" })}
        </StatusIndicator>
      )}
      <div className={styles.label}>{formatCurrency(currentValue ?? 0)}</div>
    </>
  );
};
