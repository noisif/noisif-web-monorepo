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
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import('prettier').Config
 * & import('@ianvs/prettier-plugin-sort-imports').PluginConfig} */
export const baseConfig = {
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: "none",
  printWidth: 100,
  plugins: [require.resolve("@ianvs/prettier-plugin-sort-imports")],
  importOrder: ["<BUILTIN_MODULES>", "<THIRD_PARTY_MODULES>", "^@noisif/(.*)$", "^[./]"],
  importOrderParserPlugins: ["typescript", "decorators-legacy"],
};

/** @type {import('prettier').Config
 * & import('@ianvs/prettier-plugin-sort-imports').PluginConfig} */
export const svelteConfig = {
  ...baseConfig,
  plugins: [
    require.resolve("@ianvs/prettier-plugin-sort-imports"),
    require.resolve("prettier-plugin-svelte"),
  ],
  overrides: [
    {
      files: "*.svelte",
      options: { parser: "svelte" },
    },
  ],
};
