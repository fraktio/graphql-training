import KSUID from 'ksuid'
import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { ID, Maybe } from '@app/common/types'
import { asId } from '@app/validation'
import { CollectiveAgreementRecord } from './types'

export async function getAllCollectiveAgreementRecords(
  client: PoolClient
): Promise<CollectiveAgreementRecord[]> {
  const result = await client.query(SQL`SELECT * FROM collective_agreement`)

  return result.rows.map(row => toRecord(row))
}

export async function getCollectiveAgreementRecords(
  client: PoolClient,
  ksuids: KSUID[]
): Promise<CollectiveAgreementRecord[]> {
  const result = await client.query(
    SQL`SELECT * FROM collective_agreement WHERE ksuid = ANY (${ksuids.map(ksuid => ksuid.string)})`
  )

  return result.rows.map(row => toRecord(row))
}

export async function tryGetCollectiveAgreementRecord(
  client: PoolClient,
  id: ID
): Promise<CollectiveAgreementRecord> {
  const result = await client.query(SQL`SELECT * FROM collective_agreement WHERE id = ${id}`)

  const row = result.rows[0]

  if (!row) {
    throw new Error(`CollectiveAgreement was expected to be found with id ${id}`)
  }

  return toRecord(row)
}

interface CollectiveAgreementRow
  extends Readonly<{
    id: number
    ksuid: string
    name: string
    created_at: Date
    modified_at: Maybe<Date>
  }> {}

function toRecord(row: CollectiveAgreementRow): CollectiveAgreementRecord {
  const { id, ksuid, name, created_at, modified_at } = row

  return {
    id: asId(id),
    ksuid: KSUID.parse(ksuid),
    name,
    timestamp: {
      createdAt: created_at,
      modifiedAt: modified_at
    }
  }
}
