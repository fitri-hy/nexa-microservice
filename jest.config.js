module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '(/test/.*|(\\.|/)(spec|test|e2e-spec))\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
