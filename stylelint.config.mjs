/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
  ignoreFiles: [
    '**/node_modules/**',
    '**/local-packages/**',
    '**/dist/**',
    'public/**',
    '**/coverage/**',
    '**/*.min.css'
  ],
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  rules: {
    'color-named': 'never',
    'selector-max-id': 0
  }
};
