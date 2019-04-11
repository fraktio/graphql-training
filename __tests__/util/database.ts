import { transaction } from '@app/util/database'
import { PoolConnection } from '@app/util/database/types'

export async function truncateDatabase(): Promise<void> {
  try {
    await transaction(async connection => truncate(connection))
  } catch (e) {
    // tslint:disable:no-console
    console.error(e.stack)
    // tslint:enable
  }
}

async function truncate(connection: PoolConnection): Promise<void> {
  const queries = [
    'TRUNCATE organization CASCADE',
    'TRUNCATE user_account CASCADE',
    'TRUNCATE address CASCADE'
  ]

  await Promise.all(queries.map(query => connection.query(query, [])))
}
