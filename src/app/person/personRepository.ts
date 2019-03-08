import KSUID from 'ksuid'
import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { addAddressRecord } from '@app/address/addressRepository'
import { CollectiveAgreementRecord } from '@app/collective-agreement/types'
import { ID, Maybe } from '@app/common/types'
import { addEmploymentRecord } from '@app/employment/employmentRepository'
import { AddPersonInput, Language, PersonRecord, UILanguage } from '@app/person/types'
import { ProviderRecord } from '@app/provider/types'
import { addUserRecordForPerson } from '@app/user/userRepository'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'
import { asId } from '@app/validation'

export async function getAllPersonRecords(client: PoolClient): Promise<PersonRecord[]> {
  const result = await client.query(SQL`SELECT * FROM person`)

  return result.rows.map(row => toRecord(row))
}

export async function getPersonRecords(
  client: PoolClient,
  ksuids: KSUID[]
): Promise<PersonRecord[]> {
  const result = await client.query(
    SQL`SELECT * FROM person WHERE ksuid = ANY (${ksuids.map(ksuid => ksuid.string)})`
  )

  return result.rows.map(row => toRecord(row))
}

export async function getPersonRecord(
  client: PoolClient,
  ksuid: KSUID
): Promise<Maybe<PersonRecord>> {
  const result = await client.query(SQL`SELECT * FROM person WHERE ksuid = ${ksuid.string}`)

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function tryGetPersonRecord(client: PoolClient, id: ID): Promise<PersonRecord> {
  const result = await client.query(SQL`SELECT * FROM person WHERE id = ${id}`)

  const row = result.rows[0]

  if (!row) {
    throw new Error(`Person was expected to be found with id ${id}`)
  }

  return toRecord(row)
}

interface PersonRow
  extends Readonly<{
    id: number
    ksuid: string
    user_account_id: number
    address_id: number
    first_name: string
    last_name: string
    nick_name: Maybe<string>
    personal_identity_code: string
    nationality: string
    phone: Maybe<string>
    iban: Maybe<string>
    bic: Maybe<string>
    bank_account_is_shared: boolean
    ui_language: UILanguage
    languages: string
    limitations: Maybe<string>
    preferred_working_areas: string[]
    desired_salary: Maybe<number>
    created_at: Date
    modified_at: Maybe<Date>
  }> {}

function toRecord(row: PersonRow): PersonRecord {
  const {
    id,
    ksuid,
    user_account_id,
    address_id,
    first_name,
    last_name,
    nick_name,
    personal_identity_code,
    nationality,
    phone,
    iban,
    bic,
    bank_account_is_shared,
    ui_language,
    languages,
    limitations,
    preferred_working_areas,
    desired_salary,
    created_at,
    modified_at
  } = row

  return {
    addressId: asId(address_id),
    bankAccountIsShared: bank_account_is_shared,
    bic,
    desiredSalary: desired_salary,
    firstName: first_name,
    iban,
    id: asId(id),
    ksuid: KSUID.parse(ksuid),
    languages: toLanguages(languages),
    lastName: last_name,
    limitations,
    nationality,
    nickName: nick_name,
    personalIdentityCode: personal_identity_code,
    phone,
    preferredWorkingAreas: preferred_working_areas,
    timestamp: {
      createdAt: created_at,
      modifiedAt: modified_at
    },
    uiLanguage: ui_language,
    userAccountId: asId(user_account_id)
  }
}

function toLanguages(languages: string): Language[] {
  const langs = languages.match(/[A-Z]+/g)

  return langs ? langs.map(lang => Language[lang as Language]) : []
}

export async function addPersonRecord(
  client: PoolClient,
  input: AddPersonInput,
  provider: ProviderRecord,
  collectiveAgreement: CollectiveAgreementRecord
): Promise<PersonRecord | UniqueConstraintViolationError> {
  const {
    person: {
      firstName,
      lastName,
      nickName,
      personalIdentityCode,
      nationality,
      phone,
      email,
      address,
      iban,
      limitations,
      languages,
      bankAccountIsShared,
      bic,
      desiredSalary,
      preferredWorkingAreas,
      personEmployment: { employment }
    }
  } = input

  const user = await addUserRecordForPerson(client, email)

  if (user instanceof UniqueConstraintViolationError) {
    return user
  }

  const personAddress = await addAddressRecord(client, address)

  const person = await withUniqueConstraintHandling(
    async () => {
      const ksuid = await KSUID.random()

      const insertResult = await client.query(
        SQL`
          INSERT INTO person (
            ksuid,
            user_account_id,
            address_id,
            first_name,
            last_name,
            nick_name,
            personal_identity_code,
            nationality,
            phone,
            iban,
            bic,
            bank_account_is_shared,
            ui_language,
            languages,
            limitations,
            preferred_working_areas,
            desired_salary
          ) VALUES (
            ${ksuid.string},
            ${user.id},
            ${personAddress.id},
            ${firstName},
            ${lastName},
            ${nickName},
            ${personalIdentityCode},
            ${nationality},
            ${phone},
            ${iban},
            ${bic},
            ${bankAccountIsShared},
            ${UILanguage.FI},
            ${languages},
            ${limitations},
            ${preferredWorkingAreas},
            ${desiredSalary}
          ) RETURNING id
        `
      )

      return tryGetPersonRecord(client, insertResult.rows[0].id)
    },
    error => (/personal_identity_code/.test(error) ? 'personalIdentityCode' : 'phone')
  )

  if (person instanceof UniqueConstraintViolationError) {
    return person
  }

  await addEmploymentRecord(client, employment, person, provider, collectiveAgreement)

  return person
}

export async function getPersonRecordsByProvider(
  client: PoolClient,
  provider: ProviderRecord
): Promise<PersonRecord[]> {
  const result = await client.query(
    SQL`
      SELECT DISTINCT p.* FROM person p
      INNER JOIN employment e ON e.person_id = p.id
      WHERE
        e.provider_id = ${provider.id}
    `
  )

  return result.rows.map(row => toRecord(row))
}
