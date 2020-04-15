const config = require('./jest.config')

config.testMatch = ['**/test/integration/**/?(*.)test.ts']
config.setupFilesAfterEnv = ['./setup/index.ts']

module.exports = config
