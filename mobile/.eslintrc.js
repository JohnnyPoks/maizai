module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: false,
    node: true,
    es2022: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  ignorePatterns: ["node_modules/", "android/", "ios/", "build-output/", ".expo/"],
};
