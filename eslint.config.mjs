import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    // Existing client pages intentionally load remote/local-storage state on mount.
    // Keep this advisory rule non-blocking until those flows are migrated individually.
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'prisma/**']),
]);
