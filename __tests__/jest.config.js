module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/../src/$1',
    '^@app/(.*)$': '<rootDir>/../src/app/$1',
    '^@test/(.*)$': '<rootDir>/$1'
  },
  globals: {
    'ts-jest': {
      diagnostics: false // To be able to run tests even when TypeScript fails to compile
    }
  }
}
