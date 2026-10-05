import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false, // integration tests share one database
    env: { JWT_SECRET: 'test-secret' },
    reporters: ['default', 'junit'],
    outputFile: { junit: './test-results/junit.xml' },
    coverage: { provider: 'v8', reporter: ['text', 'lcov'], include: ['src/**/*.ts'] },
  },
});
