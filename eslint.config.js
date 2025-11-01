import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import { flatConfigs as importX } from 'eslint-plugin-import-x'
import js from '@eslint/js'
import markdown from '@eslint/markdown'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
  globalIgnores([
    'dist/*',
    'spec/*',
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
  { files: ['**/*.md'], plugins: { markdown }, language: 'markdown/gfm', extends: ['markdown/recommended'] },
])
