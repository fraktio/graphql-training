import KSUID from 'ksuid'
import SQL from 'sql-template-strings'

import { editAddressRecord, tryGetAddressRecord } from '@app/address/addressRepository'
import { toFailure, toSuccess } from '@app/common'
import { ID, Maybe, Slug, Try } from '@app/common/types'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'
import { PoolConnection } from '@app/util/database/types'
import { asBusinessId, asId, asSlug } from '@app/validation'
import { EditOrganizationInput, OrganizationRecord } from './types'

export async function getOrganizationRecords(
  connection: PoolConnection,
  ids: ID[]
): Promise<OrganizationRecord[]> {
  const result = await connection.query(SQL`SELECT * FROM organization WHERE id = ANY (${ids})`)

  return result.rows.map(row => toRecord(row))
}

export async function tryGetOrganizationRecord(
  connection: PoolConnection,
  id: ID
): Promise<OrganizationRecord> {
  const result = await connection.query(SQL`SELECT * FROM organization WHERE id = ${id}`)

  const row = result.rows[0]

  if (!row) {
    throw new Error(`Organization was expected to be found with id ${id}`)
  }

  return toRecord(row)
}

export async function getOrganizationRecordsBySlugs(
  connection: PoolConnection,
  slugs: Slug[]
): Promise<OrganizationRecord[]> {
  const result = await connection.query(SQL`SELECT * FROM organization WHERE slug = ANY (${slugs})`)

  return result.rows.map(row => toRecord(row))
}

export async function getOrganizationRecordsByKsuids(
  connection: PoolConnection,
  ksuids: KSUID[]
): Promise<OrganizationRecord[]> {
  const result = await connection.query(
    SQL`SELECT * FROM organization WHERE ksuid = ANY (${ksuids.map(ksuid => ksuid.string)})`
  )

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

export async function editOrganizationRecord(
  connection: PoolConnection,
  organization: OrganizationRecord,
  input: EditOrganizationInput
): Promise<Try<OrganizationRecord, UniqueConstraintViolationError>> {
  const {
    organization: { businessId, name, slug, address }
  } = input

  const organizationResult = await withUniqueConstraintHandling(
    async () => {
      await connection.query(
        SQL`
          UPDATE organization
          SET
            business_id = ${businessId},
            name = ${name},
            slug = ${slug}
          WHERE
            id = ${organization.id}
        `
      )

      return tryGetOrganizationRecord(connection, organization.id)
    },
    error => (/business_id/.test(error) ? 'businessId' : 'slug')
  )

  if (organizationResult instanceof UniqueConstraintViolationError) {
    return toFailure(organizationResult)
  }

  const existingAddress = await tryGetAddressRecord(connection, organization.addressId)

  await editAddressRecord(connection, existingAddress, address)

  return toSuccess(organizationResult)
}
