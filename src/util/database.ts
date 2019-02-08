import { PoolClient } from 'pg'

import { getPool } from '@src/setup/database'

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()

  await client.query('BEGIN')

  try {
    const result = callback(client)

    await client.query('COMMIT')

    return result
  } catch (e) {
    await client.query('ROLLBACK')

    throw e
  } finally {
    client.release()
  }
}
