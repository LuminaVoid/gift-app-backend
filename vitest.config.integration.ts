import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./src/setup.integration.ts"],
    poolOptions: {
      threads: {
        singleThread: true,
        execArgv: ["--env-file=.env.test"],
      },
      forks: { singleFork: true, execArgv: ["--env-file=.env.test"] },
    },
    include: ["./src/**/*.integration.test.ts"],
    exclude: ["./src/**/*.unit.test.ts"],
    reporters: ["verbose"],
  },
});
