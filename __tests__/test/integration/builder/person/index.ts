import KSUID from 'ksuid'
import SQL from 'sql-template-strings'

import { CountryCode } from '@app/address/types'
import { tryGetPersonRecord } from '@app/person/personRepository'
import { Language, PersonalIdentityCode, PersonRecord } from '@app/person/types'
import { UILanguage } from '@app/user/types'
import { PoolConnection } from '@app/util/database/types'
import { asPersonalIdentityCode } from '@app/validation'
import { anAddress } from '@test/test/integration/builder/address'
import { aUser } from '@test/test/integration/builder/user'

class PersonBuilder {
  private firstName: string = 'First'
  private lastName: string = 'Last'
  private personalIdentityCode: PersonalIdentityCode = asPersonalIdentityCode('090676-656D')
  private nationality: CountryCode = CountryCode.FI
  private bankAccountIsShared: boolean = false
  private uiLanguage: UILanguage = UILanguage.FI
  private languages: Language[] = []
  private preferredWorkingAreas: string[] = []

  constructor(private readonly connection: PoolConnection) {}

  public async build(): Promise<PersonRecord> {
    const user = await aUser(this.connection).build()
    const address = await anAddress(this.connection).build()

    const ksuid = await KSUID.random()

    const insertResult = await this.connection.query(
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

    return tryGetPersonRecord(this.connection, insertResult.rows[0].id)
  }
}

export function aPerson(connection: PoolConnection): PersonBuilder {
  return new PersonBuilder(connection)
}
