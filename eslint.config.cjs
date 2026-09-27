const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const ts = require('typescript-eslint');
const globals = require('globals');
const react = require('eslint-plugin-react');
const hooks = require('eslint-plugin-react-hooks');
const a11y = require('eslint-plugin-jsx-a11y');
const jest = require('eslint-plugin-jest');
const testingLibrary = require('eslint-plugin-testing-library');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const prettier = require('eslint-config-prettier');

const typedFiles = ['client/src/**/*.{ts,tsx}', 'server/src/**/*.ts'];
const tests = ['client/src/**/*.test.{ts,tsx}', 'server/src/**/*.test.ts'];

module.exports = defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      '**/local-packages/**',
      'public/**',
      'playwright-report/**',
      'test-results/**',
      '.git/**',
      '.cache/**',
      'client/src/assets/vendor/**'
    ]
  },
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  js.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    languageOptions: { globals: globals.node },
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [ts.configs.recommended],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ]
    }
  },
  {
    files: typedFiles,
    extends: [ts.configs.recommendedTypeChecked],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: __dirname } },
    rules: {
      // Express/React callbacks may return promises that their frameworks handle.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false, arguments: false } }
      ]
    }
  },
  {
    files: ['client/src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { react, 'react-hooks': hooks, 'jsx-a11y': a11y },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...hooks.configs.recommended.rules,
      ...a11y.configs.recommended.rules,
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'error'
    }
  },
  {
    files: tests,
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/no-disabled-tests': 'error',
      'jest/no-focused-tests': 'error',
      'jest/valid-expect': 'error',
      // Test doubles and Supertest responses intentionally cross untyped library APIs.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  },
  // Jest lives in each package, so resolve its installed version from that folder.
  ...['client', 'server'].map((directory) => ({
    files: [`${directory}/src/**/*.test.{ts,tsx}`],
    settings: {
      jest: {
        version: require(
          require.resolve('jest/package.json', { paths: [`${__dirname}/${directory}`] })
        ).version
      }
    }
  })),
  {
    files: ['client/src/**/*.test.{ts,tsx}'],
    ...testingLibrary.configs['flat/react']
  },
  {
    files: ['client/src/main.test.tsx', 'client/src/liveReload.test.ts'],
    // These test the DOM bootstrap/script injection itself, rather than a React component.
    rules: { 'testing-library/no-node-access': 'off' }
  },
  prettier
);
