import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { AddressInput, AddressRecord } from '@app/address/types'

export async function getAddresses(client: PoolClient, ids: number[]): Promise<AddressRecord[]> {
  const result = await client.query(SQL`SELECT * FROM address WHERE id = ANY (${ids})`)

  return result.rows.map(row => toRecord(row))
}

export async function getAddress(client: PoolClient, id: number): Promise<AddressRecord | null> {
  const result = await client.query(SQL`SELECT * FROM address WHERE id = ${id}`)

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

async function tryGetAddress(client: PoolClient, id: number): Promise<AddressRecord> {
  const address = await getAddress(client, id)

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
    country: string | null
  }> {}

function toRecord(row: AddressRow): AddressRecord {
  const { id, street_address, postal_code, municipality, country } = row

  return {
    country,
    id,
    municipality,
    postalCode: postal_code,
    streetAddress: street_address
  }
}

export async function addAddress(client: PoolClient, input: AddressInput): Promise<AddressRecord> {
  const { streetAddress, postalCode, municipality, country } = input

  const insertResult = await client.query(
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

  return tryGetAddress(client, insertResult.rows[0].id)
}
