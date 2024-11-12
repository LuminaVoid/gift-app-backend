import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./src/setup.unit.ts"],
    poolOptions: {
      threads: { execArgv: ["--env-file=.env.test"] },
      forks: { execArgv: ["--env-file=.env.test"] },
    },
    include: ["./src/**/*.unit.test.ts"],
    exclude: [".src/**/*.integration.test.ts"],
  },
});
