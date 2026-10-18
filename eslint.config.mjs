import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  globalIgnores(['.astro/**', 'dist/**']),
  {
    rules: {
      'no-console': 'error',
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
