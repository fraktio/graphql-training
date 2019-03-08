import dotenv from 'dotenv'

import { initializeDatabase, shutdownDatabase } from '@src/setup/database'

dotenv.config()

const databaseUrl = process.env.TEST_DATABASE_URL

if (databaseUrl == null) {
  throw new Error('process.env.TEST_DATABASE_URL is not defined!')
}

beforeAll(() => {
  initializeDatabase(databaseUrl)
})

afterAll(() => {
  shutdownDatabase()
})
