import { ID, Language, Maybe, Try } from '@app/common/types'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'
import { asCountryCode, asEmail, asId, asPhone } from '@app/validation'
import { toFailure, toSuccess } from '@app/common'

import { AddEmployeeRecordInput } from '@app/company/types'
import { AddPersonToCompanyEmployeeInput } from '@app/company/types'
import KSUID from 'ksuid'
import { PoolConnection } from '@app/util/database/types'
import SQL from 'sql-template-strings'

export interface EmploymentRecord
  extends Readonly<{
    id: ID
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
