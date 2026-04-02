import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.js"],
    reporters: ["verbose", "html", "junit"],
    outputFile: {
      html: "./reports/vitest.html",
      junit: "./reports/junit.xml"
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "json-summary"],
      reportsDirectory: "./reports/coverage"
    },
    clearMocks: true,
    restoreMocks: true
  }
});
