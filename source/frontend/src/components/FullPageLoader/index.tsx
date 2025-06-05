// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useIntl } from "react-intl";
import styles from "./styles.module.scss";

interface FullPageLoaderProps {
  label?: string;
}

export const FullPageLoader = ({
  label,
}: FullPageLoaderProps) => {
  const intl = useIntl();
  const displayLabel = label ?? intl.formatMessage({ id: "common.loading" });

  return (
    <div className={styles.container}>
      <div className={styles.loader} />
      <div className={styles.label}>{displayLabel}</div>
    </div>
  );
};
