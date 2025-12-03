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
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Allow unused variables with underscore prefix
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Suppress exhaustive-deps warnings (fix incrementally)
      "react-hooks/exhaustive-deps": "warn",
      // Allow img tags (we use them intentionally in some places)
      "@next/next/no-img-element": "warn",
      // Allow any type in specific contexts (will fix incrementally)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unescaped entities (common quotes)
      "react/no-unescaped-entities": "warn",
      // Allow unused expressions (ternary operators)
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },
];

export default eslintConfig;
