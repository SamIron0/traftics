/** @type {import('ts-jest').JestConfigWithTsJest} **/
require("whatwg-fetch");

module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFiles: ["<rootDir>/jest.setup.js"],

  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
