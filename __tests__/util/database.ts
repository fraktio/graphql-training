import { PoolClient } from 'pg'

import { transaction } from '@app/util/database'

export async function truncateDatabase(): Promise<void> {
  try {
    await transaction(async client => truncate(client))
  } catch (e) {
    // tslint:disable:no-console
    console.error(e.stack)
    // tslint:enable
  }
}

async function truncate(client: PoolClient): Promise<void> {
  const queries = [
    'TRUNCATE organization CASCADE',
    'TRUNCATE user_account CASCADE',
    'TRUNCATE address CASCADE'
  ]

  await Promise.all(queries.map(query => client.query(query, [])))
}
