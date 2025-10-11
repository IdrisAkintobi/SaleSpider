import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**/*",
      "node_modules/**/*",
      "coverage/**/*",
      "dist/**/*",
      "build/**/*",
      "*.config.js",
      "*.config.ts",
      "next-env.d.ts",
      "prisma/seeds-dist/**/*"
    ]
  },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "error",
      "no-var": "error"
    }
  }
];

export default eslintConfig;