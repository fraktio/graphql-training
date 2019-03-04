import KSUID from 'ksuid'
import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { addAddress } from '@app/address/addressRepository'
import { AddPersonInput, Language, PersonRecord, UILanguage } from '@app/person/types'
import { addUserForPerson } from '@app/user/userRepository'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'

export async function getAllPersons(client: PoolClient): Promise<PersonRecord[]> {
  const result = await client.query(SQL`SELECT * FROM person`)

  return result.rows.map(row => toRecord(row))
}

export async function getPersons(client: PoolClient, ksuids: KSUID[]): Promise<PersonRecord[]> {
  const result = await client.query(
    SQL`SELECT * FROM person WHERE ksuid = ANY (${ksuids.map(ksuid => ksuid.string)})`
  )

  return result.rows.map(row => toRecord(row))
}

export async function getPerson(client: PoolClient, ksuid: KSUID): Promise<PersonRecord | null> {
  const result = await client.query(SQL`SELECT * FROM person WHERE ksuid = ${ksuid.string}`)

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

async function tryGetPerson(client: PoolClient, id: number): Promise<PersonRecord> {
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
    nick_name: string | null
    personal_identity_code: string
    nationality: string
    phone: string | null
    iban: string | null
    bic: string | null
    bank_account_is_shared: boolean
    ui_language: UILanguage
    languages: string
    limitations: string | null
    preferred_working_areas: string[]
    desired_salary: number | null
  }> {}

function toRecord(row: PersonRow): PersonRecord {
  const {
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
  } = row

  return {
    addressId: address_id,
    bankAccountIsShared: bank_account_is_shared,
    bic,
    desiredSalary: desired_salary,
    firstName: first_name,
    iban,
    ksuid: KSUID.parse(ksuid),
    languages: toLanguages(languages),
    lastName: last_name,
    limitations,
    nationality,
    nickName: nick_name,
    personalIdentityCode: personal_identity_code,
    phone,
    preferredWorkingAreas: preferred_working_areas,
    uiLanguage: ui_language,
    userAccountId: user_account_id
  }
}

function toLanguages(languages: string): Language[] {
  const langs = languages.match(/[A-Z]+/g)

  return langs ? langs.map(lang => Language[lang as Language]) : []
}

export async function addPerson(
  client: PoolClient,
  input: AddPersonInput
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
      preferredWorkingAreas
    }
  } = input

  const user = await addUserForPerson(client, email)

  if (user instanceof UniqueConstraintViolationError) {
    return user
  }

  const personAddress = await addAddress(client, address)

  return withUniqueConstraintHandling(
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

      return tryGetPerson(client, insertResult.rows[0].id)
    },
    error => (/personal_identity_code/.test(error) ? 'personalIdentityCode' : 'phone')
  )
}
