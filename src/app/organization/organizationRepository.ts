import KSUID from 'ksuid'
import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { ID, Maybe, Slug } from '@app/common/types'
import { asBusinessId, asId, asSlug } from '@app/validation'
import { OrganizationRecord } from './types'

export async function getOrganizationRecords(
  client: PoolClient,
  ids: ID[]
): Promise<OrganizationRecord[]> {
  const result = await client.query(SQL`SELECT * FROM organization WHERE id = ANY (${ids})`)

  return result.rows.map(row => toRecord(row))
}

export async function tryGetOrganizationRecord(
  client: PoolClient,
  id: ID
): Promise<OrganizationRecord> {
  const result = await client.query(SQL`SELECT * FROM organization WHERE id = ${id}`)

  const row = result.rows[0]

  if (!row) {
    throw new Error(`Organization was expected to be found with id ${id}`)
  }

  return toRecord(row)
}

export async function getOrganizationRecordsBySlugs(
  client: PoolClient,
  slugs: Slug[]
): Promise<OrganizationRecord[]> {
  const result = await client.query(SQL`SELECT * FROM organization WHERE slug = ANY (${slugs})`)

  return result.rows.map(row => toRecord(row))
}

interface OrganizationRow
  extends Readonly<{
    id: number
    ksuid: string
    name: string
    slug: string
    business_id: string
    address_id: number
    created_at: Date
    modified_at: Maybe<Date>
  }> {}

function toRecord(row: OrganizationRow): OrganizationRecord {
  const { id, ksuid, name, slug, business_id, address_id, created_at, modified_at } = row

  return {
    addressId: asId(address_id),
    businessId: asBusinessId(business_id),
    id: asId(id),
    ksuid: KSUID.parse(ksuid),
    name,
    slug: asSlug(slug),
    timestamp: {
      createdAt: created_at,
      modifiedAt: modified_at
    }
  }
}
