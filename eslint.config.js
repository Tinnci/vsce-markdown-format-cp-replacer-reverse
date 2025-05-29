// eslint.config.js
const typescriptParser = require('@typescript-eslint/parser');
const eslintPluginTs = require('@typescript-eslint/eslint-plugin');
const stylisticPlugin = require('@stylistic/eslint-plugin');

module.exports = [
  {
    // Equivalent to "root": true
    // root: true, // Not needed in new config format as config file is root by default

    files: ["src/**/*.ts"], // Apply to TypeScript files in src directory

    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
      },
    },

    plugins: {
      "@typescript-eslint": eslintPluginTs,
      "@stylistic": stylisticPlugin, // Add stylistic plugin
    },

    rules: {
      "@typescript-eslint/naming-convention": "warn",
      // "@typescript-eslint/semi": "warn", // Remove deprecated rule
      "curly": "warn",
      "eqeqeq": "warn",
      "no-throw-literal": "warn",
      "semi": "off", // Disable base rule as recommended by @typescript-eslint
      "@stylistic/semi": ["warn", "always"], // Configure semi rule from stylistic plugin
    },
  },
  {
    // Equivalent to "ignorePatterns"
    ignores: ["**/*.d.ts"], // Ignore declaration files
  },
]; 