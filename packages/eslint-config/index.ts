/**
 * Copyright (c) 2022-2026 NOISIF. All Rights Reserved.
 *
 * NOTICE: This source code is publicly available for reference
 * and educational purposes only. It is NOT open-source software.
 *
 * You are granted permission to view this code. However, you are strictly
 * PROHIBITED from copying, modifying, or merging this code into other software,
 * distributing, publishing, or sublicensing this code, using this code for
 * commercial purposes or in production environments.
 *
 * THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * Please refer to the LICENSE file in the root directory for full restrictions.
 */
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const sharedRules = defineConfig({
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }
    ]
  }
});

export const createBaseConfig = (tsconfigRootDir: string) =>
  defineConfig(
    js.configs.recommended,
    ts.configs.recommended,
    {
      languageOptions: {
        globals: { ...globals.node },
        parserOptions: {
          tsconfigRootDir
        }
      }
    },
    sharedRules,
    prettier,
    {
      ignores: ['dist/', 'build/', 'node_modules/']
    }
  );

export const createSvelteConfig = (tsconfigRootDir: string) =>
  defineConfig(
    js.configs.recommended,
    ts.configs.recommended,
    svelte.configs.recommended,
    {
      languageOptions: {
        globals: { ...globals.browser, ...globals.node },
        parserOptions: {
          tsconfigRootDir
        }
      }
    },
    {
      files: ['**/*.svelte', '**/*.svelte.ts'],
      languageOptions: {
        parserOptions: {
          extraFileExtensions: ['.svelte'],
          parser: ts.parser
        }
      }
    },
    sharedRules,
    prettier,
    svelte.configs.prettier,
    {
      ignores: ['.svelte-kit/', 'dist/', 'build/', 'node_modules/']
    }
  );
