import {
  AddCompanyInput,
  CompanyByEmployeeRecord,
  CompanyRecord,
  EditCompanyInput
} from '@app/company/types'
import { ID, Language, Maybe, Try } from '@app/common/types'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'
import { asCountryCode, asEmail, asId, asPhone } from '@app/validation'
import { toFailure, toSuccess } from '@app/common'

import KSUID from 'ksuid'
import { PoolConnection } from '@app/util/database/types'
import SQL from 'sql-template-strings'

export async function getCompanyRecords(connection: PoolConnection): Promise<CompanyRecord[]> {
  const result = await connection.query(SQL`SELECT * FROM company`)

  return result.rows.map(row => toRecord(row))
}

export async function getCompanyRecordsByIds(
  connection: PoolConnection,
  ids: ID[]
): Promise<CompanyRecord[]> {
  const result = await connection.query(SQL`SELECT * FROM company WHERE id = ANY (${ids})`)

  return result.rows.map(row => toRecord(row))
}

export async function getCompanyRecordsByKsuids(
  connection: PoolConnection,
  ksuids: KSUID[]
): Promise<CompanyRecord[]> {
  const result = await connection.query(
    SQL`SELECT * FROM company WHERE ksuid = ANY (${ksuids.map(ksuid => ksuid.string)})`
  )

  return result.rows.map(row => toRecord(row))
}

export async function tryGetCompanyRecord(
  connection: PoolConnection,
  id: ID
): Promise<CompanyRecord> {
  const result = await connection.query(SQL`SELECT * FROM company WHERE id = ${id}`)

  const row = result.rows[0]

  if (!row) {
    throw new Error(`Company was expected to be found with id ${id}`)
  }

  return toRecord(row)
}

interface CompanyRow
  extends Readonly<{
    id: number
    ksuid: string
    name: string
    created_at: Date
    modified_at: Maybe<Date>
  }> {}

function toRecord(row: CompanyRow): CompanyRecord {
  const { id, ksuid, name, created_at, modified_at } = row

  return {
    id: asId(id),
    ksuid: KSUID.parse(ksuid),
    name: name,
    timestamp: {
      createdAt: created_at,
      modifiedAt: modified_at
    }
  }
}

export async function addCompanyRecord(
  connection: PoolConnection,
  input: AddCompanyInput
): Promise<Try<CompanyRecord, UniqueConstraintViolationError>> {
  const {
    company: { name }
  } = input

  const company = await withUniqueConstraintHandling(
    async () => {
      const ksuid = await KSUID.random()

      const insertResult = await connection.query(
        SQL`
          INSERT INTO company (
            ksuid,
            name
          ) VALUES (
            ${ksuid.string},
            ${name}
          ) RETURNING id
        `
      )

      return tryGetCompanyRecord(connection, insertResult.rows[0].id)
    },
    error => error.toString()
  )

  if (company instanceof UniqueConstraintViolationError) {
    return toFailure(company)
  }

  return toSuccess(company)
}

export async function editCompanyRecord(
  connection: PoolConnection,
  company: CompanyRecord,
  input: EditCompanyInput
): Promise<Try<CompanyRecord, UniqueConstraintViolationError>> {
  const {
    company: { name }
  } = input

  const editedCompany = await withUniqueConstraintHandling(
    async () => {
      await connection.query(
        SQL`
          UPDATE company
          SET
            name = ${name}
          WHERE
            id = ${company.id}
        `
      )

      return tryGetCompanyRecord(connection, company.id)
    },
    error => error.toString()
  )

  if (editedCompany instanceof UniqueConstraintViolationError) {
    return toFailure(editedCompany)
  }

  return toSuccess(editedCompany)
}

export async function getCompaniesByEmployees(
  connection: PoolConnection,
  personIds: ID[]
): Promise<CompanyByEmployeeRecord[]> {
  const result = await connection.query(
    SQL`SELECT company.*, employment.person_id FROM company
      LEFT JOIN employment ON employment.company_id = company.id
      WHERE employment.person_id = ANY (${personIds})`
  )
  return result.rows.map(row => toCompanyByEmployeeRecord(row))
}

interface CompanyByEmployeeRow extends CompanyRow {
  person_id: number
}

function toCompanyByEmployeeRecord(row: CompanyByEmployeeRow): CompanyByEmployeeRecord {
  const { person_id } = row

  return {
    personId: asId(person_id),
    company: toRecord(row)
  }
}
