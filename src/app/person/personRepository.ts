import { PoolClient } from 'pg'

import { PersonRecord } from '.'

export async function getPerson(
  client: PoolClient,
  id: number
): Promise<PersonRecord | null> {
  const result = await client.query('SELECT * FROM person WHERE id = $1', [id])

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

interface PersonRow {
  id: number
}

function toRecord(row: PersonRow): PersonRecord {
  const { id } = row

  return {
    id
  }
}
