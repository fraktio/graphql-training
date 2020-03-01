import {
  AddPersonInput,
  EditPersonInput,
  PersonByEmployerRecord,
  PersonRecord
} from '@app/person/types'
import { ID, Language, Maybe, Try } from '@app/common/types'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'
import { asCountryCode, asEmail, asId, asPersonalIdentityCode, asPhone } from '@app/validation'
import { toFailure, toSuccess } from '@app/common'

import KSUID from 'ksuid'
import { PoolConnection } from '@app/util/database/types'
import SQL from 'sql-template-strings'

export async function getPersonRecords(connection: PoolConnection): Promise<PersonRecord[]> {
  const result = await connection.query(SQL`SELECT * FROM person`)

  console.log(result)
  return result.rows.map(row => toRecord(row))
}

export async function getPersonRecordsByIds(
  connection: PoolConnection,
  ids: ID[]
): Promise<PersonRecord[]> {
  const result = await connection.query(SQL`SELECT * FROM person WHERE id = ANY (${ids})`)

  return result.rows.map(row => toRecord(row))
}

export async function getPersonRecordsByKsuids(
  connection: PoolConnection,
  ksuids: KSUID[]
): Promise<PersonRecord[]> {
  const result = await connection.query(
    SQL`SELECT * FROM person WHERE ksuid = ANY (${ksuids.map(ksuid => ksuid.string)})`
  )

  return result.rows.map(row => toRecord(row))
}

export async function tryGetPersonRecord(
  connection: PoolConnection,
  id: ID
): Promise<PersonRecord> {
  const result = await connection.query(SQL`SELECT * FROM person WHERE id = ${id}`)

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
    first_name: string
    last_name: string
    personal_identity_code: string
    phone: Maybe<string>
    email: Maybe<string>
    languages: string
    nationality: string
    birthday: Date
    created_at: Date
    modified_at: Maybe<Date>
  }> {}

function toRecord(row: PersonRow): PersonRecord {
  const {
    id,
    ksuid,
    first_name,
    last_name,
    personal_identity_code,
    phone,
    email,
    languages,
    nationality,
    birthday,
    created_at,
    modified_at
  } = row

  return {
    id: asId(id),
    ksuid: KSUID.parse(ksuid),
    firstName: first_name,
    lastName: last_name,
    nationality: asCountryCode(nationality),
    languages: toLanguages(languages),
    personalIdentityCode: asPersonalIdentityCode(personal_identity_code),
    phone: phone ? asPhone(phone) : null,
    email: email ? asEmail(email) : null,
    birthDay: birthday,
    timestamp: {
      createdAt: created_at,
      modifiedAt: modified_at
    }
  }
}

function toLanguages(languages: string): Language[] {
  const langs = languages.match(/[A-Z]+/g)

  return langs ? langs.map(lang => Language[lang as Language]) : []
}

export async function addPersonRecord(
  connection: PoolConnection,
  input: AddPersonInput
): Promise<Try<PersonRecord, UniqueConstraintViolationError>> {
  const {
    person: {
      firstName,
      lastName,
      personalIdentityCode,
      phone,
      email,
      nationality,
      languages,
      birthDay
    }
  } = input

  const person = await withUniqueConstraintHandling(
    async () => {
      const ksuid = await KSUID.random()

      const insertResult = await connection.query(
        SQL`
          INSERT INTO person (
            ksuid,
            first_name,
            last_name,
            personal_identity_code,
            phone,
            email,
            nationality,
            languages,
            birthday
          ) VALUES (
            ${ksuid.string},
            ${firstName},
            ${lastName},
            ${personalIdentityCode},
            ${phone},
            ${email},
            ${nationality},
            ${languages},
            ${birthDay}
          ) RETURNING id
        `
      )

      return tryGetPersonRecord(connection, insertResult.rows[0].id)
    },
    error => error.toString()
  )

  if (person instanceof UniqueConstraintViolationError) {
    return toFailure(person)
  }

  return toSuccess(person)
}

export async function editPersonRecord(
  connection: PoolConnection,
  person: PersonRecord,
  input: EditPersonInput
): Promise<Try<PersonRecord, UniqueConstraintViolationError>> {
  const {
    person: {
      firstName,
      lastName,
      personalIdentityCode,
      phone,
      email,
      nationality,
      languages,
      birthDay
    }
  } = input

  const editedPerson = await withUniqueConstraintHandling(
    async () => {
      await connection.query(
        SQL`
          UPDATE person
          SET
            first_name = ${firstName},
            last_name = ${lastName},
            personal_identity_code = ${personalIdentityCode},
            phone = ${phone},
            email = ${email},
            nationality = ${nationality},
            languages = ${languages},
            birthday = ${birthDay},
          WHERE
            id = ${person.id}
        `
      )

      return tryGetPersonRecord(connection, person.id)
    },
    error => error.toString()
  )

  if (editedPerson instanceof UniqueConstraintViolationError) {
    return toFailure(editedPerson)
  }

  return toSuccess(editedPerson)
}

export async function getPersonsByEmployers(
  connection: PoolConnection,
  companyIds: ID[]
): Promise<PersonByEmployerRecord[]> {
  const result = await connection.query(
    SQL`SELECT person.*, employment.company_id FROM person
      LEFT JOIN employment ON employment.person_id = person.id
      WHERE employment.company_id = ANY (${companyIds})`
  )

  return result.rows.map(row => toPersonByEmployerRecord(row))
}

interface PersonByEmployerRow extends PersonRow {
  company_id: number
}

function toPersonByEmployerRecord(row: PersonByEmployerRow): PersonByEmployerRecord {
  const { company_id } = row

  return {
    companyId: asId(company_id),
    person: toRecord(row)
  }
}
