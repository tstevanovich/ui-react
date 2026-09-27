/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/index.ts'],
  clearMocks: true,
  restoreMocks: true,
  coverageThreshold: { global: { statements: 80, branches: 70, functions: 80, lines: 80 } },
  verbose: true,
  setupFiles: ['./jest.env.js'],
  coverageReporters: ['lcov', 'text'],
  collectCoverage: true,
  reporters: ['default', 'jest-junit']
};

module.exports = config;
