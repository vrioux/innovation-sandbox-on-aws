// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json", "lcov"],
      reportsDirectory: "coverage",
      include: ["source/**/*.{ts,tsx}"],
      exclude: [
        "source/e2e",
        "source/**/*.test.{ts,tsx}",
        "**/vitest.config.ts",
        "source/lambdas/lambda-test-utils",
        "source/frontend/src/components",
      ],
    },
    env: {
      POWERTOOLS_TRACE_ENABLED: "false",
    },
  },
});
