// .vscode-test.js
const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  files: 'out/test/**/*.test.js',
  // You can specify other options here, like VS Code version
  // version: 'stable',
}); 