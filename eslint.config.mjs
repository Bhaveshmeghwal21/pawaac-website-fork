import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated, gitignored, and not part of the app. These are design-sync
    // tooling scratch and its compiled bundle (see the matching block in
    // .gitignore). Nothing under src/ imports them, but eslint still walked
    // them and reported 36 errors from vendored React and a minified bundle —
    // enough to make `npm run lint` exit non-zero and fail a CI build for
    // reasons that have nothing to do with this codebase.
    ".ds-sync/**",
    "ds-bundle/**",
    ".design-sync/**",
  ]),
]);

export default eslintConfig;
