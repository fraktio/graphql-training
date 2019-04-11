import KSUID from 'ksuid'
import SQL from 'sql-template-strings'

import { ID, Maybe, Slug } from '@app/common/types'
import { OrganizationRecord } from '@app/organization/types'
import { PoolConnection } from '@app/util/database/types'
import { asBusinessId, asId, asSlug } from '@app/validation'
import { ProviderPersonRecord, ProviderRecord } from './types'

export async function getProviderRecords(
  connection: PoolConnection,
  ids: ID[]
): Promise<ProviderRecord[]> {
  const result = await connection.query(SQL`SELECT * FROM provider WHERE id = ANY (${ids})`)

  return result.rows.map(row => toRecord(row))
}

export async function getProviderRecordsByKsuids(
  connection: PoolConnection,
  ksuids: KSUID[]
): Promise<ProviderRecord[]> {
  const result = await connection.query(
    SQL`SELECT * FROM provider WHERE ksuid = ANY (${ksuids.map(ksuid => ksuid.string)})`
  )

  return result.rows.map(row => toRecord(row))
}

export async function getProviderRecordByKsuid(
  connection: PoolConnection,
  ksuid: KSUID
): Promise<Maybe<ProviderRecord>> {
  const result = await connection.query(SQL`SELECT * FROM provider WHERE ksuid = ${ksuid.string}`)

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function tryGetProviderRecord(
  connection: PoolConnection,
  id: ID
): Promise<ProviderRecord> {
  const result = await connection.query(SQL`SELECT * FROM provider WHERE id = ${id}`)

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
    businessId: asBusinessId(business_id),
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
  connection: PoolConnection,
  organization: OrganizationRecord
): Promise<ProviderRecord[]> {
  const result = await connection.query(
    SQL`
      SELECT * FROM provider
      WHERE
        organization_id = ${organization.id}
    `
  )

  return result.rows.map(row => toRecord(row))
}

export async function getProviderRecordBySlugs(
  connection: PoolConnection,
  organizationSlug: Slug,
  providerSlug: Slug
): Promise<Maybe<ProviderRecord>> {
  const result = await connection.query(
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

export async function getProviderPersonRecordBySlugsAndPersonKsuid(
  connection: PoolConnection,
  organizationSlug: Slug,
  providerSlug: Slug,
  personKsuid: KSUID
): Promise<Maybe<ProviderPersonRecord>> {
  const result = await connection.query(
    SQL`
      SELECT DISTINCT
        pr.id AS provider_id,
        pe.id AS person_id
      FROM provider pr
      INNER JOIN organization o ON pr.organization_id = o.id
      INNER JOIN employment e ON e.provider_id = pr.id
      INNER JOIN person pe ON pe.id = e.person_id
      WHERE
        pr.slug = ${providerSlug}
        AND o.slug = ${organizationSlug}
        AND pe.ksuid = ${personKsuid.string}
    `
  )

  const row = result.rows[0]

  return row ? toProviderPersonRecord(row) : null
}

interface ProviderPersonRow {
  person_id: number
  provider_id: number
}

function toProviderPersonRecord(row: ProviderPersonRow): ProviderPersonRecord {
  const { person_id, provider_id } = row

  return {
    personId: asId(person_id),
    providerId: asId(provider_id)
  }
}

export async function getProviderPersonRecordByProviderKsuidAndPersonKsuid(
  connection: PoolConnection,
  providerKsuid: KSUID,
  personKsuid: KSUID
): Promise<Maybe<ProviderPersonRecord>> {
  const result = await connection.query(
    SQL`
      SELECT DISTINCT
        pr.id AS provider_id,
        pe.id AS person_id
      FROM provider pr
      INNER JOIN employment e ON e.provider_id = pr.id
      INNER JOIN person pe ON pe.id = e.person_id
      WHERE
        pr.ksuid = ${providerKsuid.string}
        AND pe.ksuid = ${personKsuid.string}
    `
  )

  const row = result.rows[0]

  return row ? toProviderPersonRecord(row) : null
}
