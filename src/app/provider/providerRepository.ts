import KSUID from 'ksuid'
import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { ID, Maybe, Slug } from '@app/common/types'
import { OrganizationRecord } from '@app/organization/types'
import { asBusinessID, asId, asSlug } from '@app/validation'
import { ProviderRecord } from './types'

export async function getProviderRecords(
  client: PoolClient,
  ksuids: KSUID[]
): Promise<ProviderRecord[]> {
  const result = await client.query(
    SQL`SELECT * FROM provider WHERE ksuid = ANY (${ksuids.map(ksuid => ksuid.string)})`
  )

  return result.rows.map(row => toRecord(row))
}

export async function getProviderRecord(
  client: PoolClient,
  ksuid: KSUID
): Promise<Maybe<ProviderRecord>> {
  const result = await client.query(SQL`SELECT * FROM provider WHERE ksuid = ${ksuid.string}`)

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function tryGetProviderRecord(client: PoolClient, id: ID): Promise<ProviderRecord> {
  const result = await client.query(SQL`SELECT * FROM provider WHERE id = ${id}`)

  const row = result.rows[0]

  if (!row) {
    throw new Error(`Provider was expected to be found with id ${id}`)
  }

  return toRecord(row)
}

interface ProviderRow
  extends Readonly<{
    id: number
    ksuid: string
    organization_id: number
    slug: string
    name: string
    business_id: string
    address_id: number
    created_at: Date
    modified_at: Maybe<Date>
  }> {}

function toRecord(row: ProviderRow): ProviderRecord {
  const {
    id,
    ksuid,
    slug,
    name,
    business_id,
    address_id,
    organization_id,
    created_at,
    modified_at
  } = row

  return {
    addressId: asId(address_id),
    businessId: asBusinessID(business_id),
    id: asId(id),
    ksuid: KSUID.parse(ksuid),
    name,
    organizationId: asId(organization_id),
    slug: asSlug(slug),
    timestamp: {
      createdAt: created_at,
      modifiedAt: modified_at
    }
  }
}

export async function getProviderRecordsByOrganization(
  client: PoolClient,
  organization: OrganizationRecord
): Promise<ProviderRecord[]> {
  const result = await client.query(
    SQL`
      SELECT * FROM provider
      WHERE
        organization_id = ${organization.id}
    `
  )

  return result.rows.map(row => toRecord(row))
}

export async function getProviderRecordByOrganizationSlugAndProviderSlug(
  client: PoolClient,
  organizationSlug: Slug,
  providerSlug: Slug
): Promise<Maybe<ProviderRecord>> {
  const result = await client.query(
    SQL`
      SELECT p.* FROM provider p
      INNER JOIN organization o ON p.organization_id = o.id
      WHERE
        p.slug = ${providerSlug}
        AND o.slug = ${organizationSlug}
    `
  )

  const row = result.rows[0]

  return row ? toRecord(row) : null
}
