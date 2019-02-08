import { Pool } from 'pg'

let pool: Pool

export function initializeDatabase(connectionString: string): void {
  pool = new Pool({
    connectionString,
    idleTimeoutMillis: 30000,
    max: 15
  })
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool is not initialized')
  }

  return pool
}
