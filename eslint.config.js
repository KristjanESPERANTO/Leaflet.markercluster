import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import { flatConfigs as importX } from 'eslint-plugin-import-x'
import js from '@eslint/js'
import markdown from '@eslint/markdown'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
  globalIgnores([
    'dist/*',
    'test-results/*',
  ]),
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 'latest', globals: { ...globals.browser } },
    extends: [importX.recommended, js.configs.recommended, stylistic.configs.recommended],
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['spec/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        // Playwright test globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        xit: 'readonly',
        // Sinon
        sinon: 'readonly',
      },
    },
    rules: {
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-unresolved': ['error', { ignore: ['^leaflet.markercluster$'] }],
    },
  },
  { files: ['**/*.md'], plugins: { markdown }, language: 'markdown/gfm', extends: ['markdown/recommended'] },
])
