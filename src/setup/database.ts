import { Pool } from 'pg'

import { Maybe } from '@app/common/types'

let pool: Maybe<Pool>

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

export function shutdownDatabase(): void {
  if (!pool) {
    throw new Error('Cannot shutdown database because pool is not initialized')
  }

  pool.end()
}
