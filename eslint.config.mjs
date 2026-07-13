import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["node_modules/**", "test-results/**", "html-report/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["cucumber.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "writable",
        require: "readonly",
      },
    },
  },
];
