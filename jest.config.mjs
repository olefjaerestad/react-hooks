/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx'],
  rootDir: '.',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
};

export default config;
