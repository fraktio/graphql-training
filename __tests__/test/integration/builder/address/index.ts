import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { tryGetAddressRecord } from '@app/address/addressRepository'
import { AddressRecord, Country, Municipality, PostalCode } from '@app/address/types'

class AddressBuilder {
  private streetAddress: string = 'Street address 123'
  private postalCode: PostalCode = '00100'
  private municipality: Municipality = 'Helsinki'
  private country: Country = 'FI'

  constructor(private readonly client: PoolClient) {}

  public async build(): Promise<AddressRecord> {
    const insertResult = await this.client.query(
      SQL`
        INSERT INTO address (
          street_address,
          postal_code,
          municipality,
          country
        ) VALUES (
          ${this.streetAddress},
          ${this.postalCode},
          ${this.municipality},
          ${this.country}
        ) RETURNING id
      `
    )

    return tryGetAddressRecord(this.client, insertResult.rows[0].id)
  }
}

export function anAddress(client: PoolClient): AddressBuilder {
  return new AddressBuilder(client)
}
