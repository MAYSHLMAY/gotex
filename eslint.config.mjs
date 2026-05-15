import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // Turn off the most strict rules for now
      '@typescript-eslint/no-explicit-any': 'warn', // Warning instead of error
      '@typescript-eslint/no-unused-vars': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig