const path = require('path');
const {defineConfig} = require('@playwright/test');
const evidence = path.resolve(__dirname, '../test-evidence/admin-fe02c01');

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: 'admin-fe02c01.spec.js',
  forbidOnly: true,
  retries: 0,
  workers: 1,
  outputDir: path.join(evidence, '02c-test-results'),
  reporter: [['line'], ['json', {outputFile: path.join(evidence, '02c-results.json')}]],
  metadata: {candidate: process.env.GITHUB_SHA || 'local', suite: 'ADMIN-FE-02C-01 R2'},
  use: {screenshot: 'only-on-failure', trace: 'retain-on-failure'},
});
