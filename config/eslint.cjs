/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "prettier",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:sonarjs/recommended",
    "plugin:unicorn/recommended",
  ],
  env: {
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    createDefaultProgram: false,
  },
  plugins: ["@typescript-eslint/eslint-plugin", "sonarjs", "import"],
  ignorePatterns: [".eslintrc.js", ".eslintrc.cjs", "eslint.cjs", "migrations"],
  rules: {
    // import
    "import/extensions": [
      "error",
      "ignorePackages",
      { ts: "ignorePackages", js: "never" },
    ],

    // sonar
    "sonarjs/no-duplicate-string": "off",

    // unicorn
    "unicorn/prefer-object-from-entries": "off",
    "unicorn/no-array-method-this-argument": "off",
    "unicorn/no-array-reduce": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/expiring-todo-comments": "off",
    "unicorn/no-null": "off",

    // ts
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "separate-type-imports" },
    ],
  },
  reportUnusedDisableDirectives: true,
};
