import { FlatCompat } from '@eslint/eslintrc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'prettier', // 🔥 desliga regras conflitantes
  ),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
            // 🔥 ordena imports
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // 🔥 REMOVE imports não usados
      'unused-imports/no-unused-imports': 'error',

      // 🔧 evita conflito com TS
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },
];
