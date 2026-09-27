module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transformIgnorePatterns: ['/node_modules/(?!@mui/x-data-grid)'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['main.tsx', 'setupTests.ts', '\\.d\\.ts$'],
  clearMocks: true,
  restoreMocks: true,
  coverageThreshold: { global: { statements: 80, branches: 70, functions: 80, lines: 80 } },
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: { allowJs: true, module: 'commonjs', moduleResolution: 'node' }
      }
    ],
    '.+\\.(css|styl|less|sass|scss)$': 'jest-css-modules-transform'
  },
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['lcov', 'json', 'html', 'clover', 'text']
};
