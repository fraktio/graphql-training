import KSUID from 'ksuid'
import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { tryGetPersonRecord } from '@app/person/personRepository'
import {
  Language,
  Nationality,
  PersonalIdentityCode,
  PersonRecord,
  UILanguage
} from '@app/person/types'
import { anAddress } from '@test/test/integration/builder/address'
import { aUser } from '@test/test/integration/builder/user'

class PersonBuilder {
  private firstName: string = 'First'
  private lastName: string = 'Last'
  private personalIdentityCode: PersonalIdentityCode = '090676-656D'
  private nationality: Nationality = 'FIN'
  private bankAccountIsShared: boolean = false
  private uiLanguage: UILanguage = UILanguage.FI
  private languages: Language[] = []
  private preferredWorkingAreas: string[] = []

  constructor(private readonly client: PoolClient) {}

  public async build(): Promise<PersonRecord> {
    const user = await aUser(this.client).build()
    const address = await anAddress(this.client).build()

    const ksuid = await KSUID.random()

    const insertResult = await this.client.query(
      SQL`
        INSERT INTO person (
          ksuid,
          first_name,
          last_name,
          personal_identity_code,
          nationality,
          bank_account_is_shared,
          ui_language,
          languages,
          preferred_working_areas,
          user_account_id,
          address_id
        ) VALUES (
          ${ksuid.string},
          ${this.firstName},
          ${this.lastName},
          ${this.personalIdentityCode},
          ${this.nationality},
          ${this.bankAccountIsShared},
          ${this.uiLanguage},
          ${this.languages},
          ${this.preferredWorkingAreas},
          ${user.id},
          ${address.id}
        ) RETURNING id
      `
    )

    return tryGetPersonRecord(this.client, insertResult.rows[0].id)
  }
}

export function aPerson(client: PoolClient): PersonBuilder {
  return new PersonBuilder(client)
}
