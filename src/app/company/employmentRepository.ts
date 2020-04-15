import { AddEmployeeRecordInput, RemoveEmployeeRecordFromCompanyInput } from '@app/company/types'
import { ID, Language, Maybe, Success, Try } from '@app/common/types'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'
import { asCountryCode, asEmail, asId, asPhone } from '@app/validation'
import { toFailure, toSuccess } from '@app/common'

import KSUID from 'ksuid'
import { PoolConnection } from '@app/util/database/types'
import SQL from 'sql-template-strings'

export interface EmploymentRecord
  extends Readonly<{
    id: ID
  }> {}

export interface RemovedEmployee
  extends Readonly<{
    removedEmployee: {
      personId: ID
      companyId: ID
    }
  }> {}

export async function addEmployeeRecord(
  connection: PoolConnection,
  input: AddEmployeeRecordInput
): Promise<Try<EmploymentRecord, UniqueConstraintViolationError>> {
  const { person, company } = input

  const employment = await withUniqueConstraintHandling(
    async () => {
      const ksuid = await KSUID.random()

      const insertResult = await connection.query(
        SQL`
          INSERT INTO employment (
            company_id,
            person_id
          ) VALUES (
            ${company.id},
            ${person.id}
          ) RETURNING id
        `
      )
      return { id: insertResult.rows[0].id as ID }
    },
    error => error.toString()
  )

  if (employment instanceof UniqueConstraintViolationError) {
    return toFailure(employment)
  }

  return toSuccess(employment)
}

export async function removeEmployeeRecordFromCompany(
  connection: PoolConnection,
  input: RemoveEmployeeRecordFromCompanyInput
): Promise<Success<RemovedEmployee>> {
  const { person, company } = input

  const result = await connection.query(
    SQL`
          DELETE FROM employment
          WHERE person_id =  ${person.id}
          AND company_id = ${company.id}
        `
  )
  const successResponse = { removedEmployee: { personId: person.id, companyId: company.id } }
  return toSuccess(successResponse)
}
