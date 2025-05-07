module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!**/*.module.ts",
    "!**/main.ts",
    "!**/node_modules/**",
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  testEnvironment: 'node',
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
  },
  coverageDirectory: './coverage'
};