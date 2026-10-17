import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  globalIgnores(['.astro/**', 'dist/**']),
  {
    rules: {
      'no-console': 'error',
      quotes: ['error', 'single', {
        avoidEscape: true,
        allowTemplateLiterals: false,
      }],
      semi: ['error', 'never'],
      'brace-style': ['error', 'stroustrup', {
        allowSingleLine: true,
      }],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    files: ['src/main/**/*.cts', 'src/preload/**/*.cts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
])

export default eslintConfig
