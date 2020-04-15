const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  default: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: 'migrations'
    }
  },

  test: {
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
    migrations: {
      tableName: 'migrations'
    }
  }
}
