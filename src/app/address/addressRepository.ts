import SQL from 'sql-template-strings'

import { AddressInput, AddressRecord } from '@app/address/types'
import { ID, Maybe } from '@app/common/types'
import { PoolConnection } from '@app/util/database/types'
import { asCountryCode, asId, asMunicipality, asPostalCode } from '@app/validation'

export async function getAddressRecords(
  connection: PoolConnection,
  ids: ID[]
): Promise<AddressRecord[]> {
  const result = await connection.query(SQL`SELECT * FROM address WHERE id = ANY (${ids})`)

  return result.rows.map(row => toRecord(row))
}

export async function getAddressRecord(
  connection: PoolConnection,
  id: ID
): Promise<Maybe<AddressRecord>> {
  const result = await connection.query(SQL`SELECT * FROM address WHERE id = ${id}`)

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function tryGetAddressRecord(
  connection: PoolConnection,
  id: ID
): Promise<AddressRecord> {
  const address = await getAddressRecord(connection, id)

  if (!address) {
    throw new Error(`Address was expected to be found with id ${id}`)
  }

  return address
}

interface AddressRow
  extends Readonly<{
    id: number
    street_address: string
    postal_code: string
    municipality: string
    country: string
  }> {}

function toRecord(row: AddressRow): AddressRecord {
  const { id, street_address, postal_code, municipality, country } = row

  return {
    country: asCountryCode(country),
    id: asId(id),
    municipality: asMunicipality(municipality),
    postalCode: asPostalCode(postal_code),
    streetAddress: street_address
  }
}

export async function addAddressRecord(
  connection: PoolConnection,
  input: AddressInput
): Promise<AddressRecord> {
  const { streetAddress, postalCode, municipality, country } = input

  const insertResult = await connection.query(
    SQL`
      INSERT INTO address (
        street_address,
        postal_code,
        municipality,
        country
      ) VALUES (
        ${streetAddress},
        ${postalCode},
        ${municipality},
        ${country}
      ) RETURNING id
    `
  )

  return tryGetAddressRecord(connection, insertResult.rows[0].id)
}

export async function editAddressRecord(
  connection: PoolConnection,
  address: AddressRecord,
  input: AddressInput
): Promise<AddressRecord> {
  const { streetAddress, postalCode, municipality, country } = input

  await connection.query(
    SQL`
      UPDATE address
      SET
        street_address = ${streetAddress},
        postal_code = ${postalCode},
        municipality = ${municipality},
        country = ${country}
      WHERE
        id = ${address.id}
    `
  )

  return tryGetAddressRecord(connection, address.id)
}
