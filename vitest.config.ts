import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
      setupFiles: ['lib/tests/setup.ts'],
      fileParallelism: false,
      disableConsoleIntercept: true,
      testTimeout: 35_000
    },
});