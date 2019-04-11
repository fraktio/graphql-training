import KSUID from 'ksuid'
import SQL from 'sql-template-strings'

import { CollectiveAgreementRecord } from '@app/collective-agreement/types'
import { ID, Maybe } from '@app/common/types'
import { PersonRecord } from '@app/person/types'
import { ProviderPersonRecord, ProviderRecord } from '@app/provider/types'
import { PoolConnection } from '@app/util/database/types'
import { asHour, asId } from '@app/validation'
import { EmploymentInput, EmploymentRecord, EmploymentType } from './types'

export async function getEmploymentRecords(
  connection: PoolConnection,
  ksuids: KSUID[]
): Promise<EmploymentRecord[]> {
  const result = await connection.query(
    SQL`SELECT * FROM employment WHERE ksuid = ANY (${ksuids.map(ksuid => ksuid.string)})`
  )

  return result.rows.map(row => toRecord(row))
}

export async function tryGetEmploymentRecord(
  connection: PoolConnection,
  id: ID
): Promise<EmploymentRecord> {
  const result = await connection.query(SQL`SELECT * FROM employment WHERE id = ${id}`)

  const row = result.rows[0]

  if (!row) {
    throw new Error(`Employment was expected to be found with id ${id}`)
  }

  return toRecord(row)
}

interface EmploymentRow
  extends Readonly<{
    id: number
    ksuid: string
    person_id: number
    provider_id: number
    collective_agreement_id: number
    type: EmploymentType
    start_date: Maybe<Date>
    end_date: Maybe<Date>
    average_hours: Maybe<number>
    description: Maybe<string>
    created_at: Date
    modified_at: Maybe<Date>
  }> {}

function toRecord(row: EmploymentRow): EmploymentRecord {
  const {
    id,
    ksuid,
    person_id,
    provider_id,
    collective_agreement_id,
    type,
    start_date,
    end_date,
    average_hours,
    description,
    created_at,
    modified_at
  } = row

  return {
    averageHours: average_hours == null ? null : asHour(average_hours),
    collectiveAgreementId: asId(collective_agreement_id),
    description,
    endDate: end_date,
    id: asId(id),
    ksuid: KSUID.parse(ksuid),
    personId: asId(person_id),
    providerId: asId(provider_id),
    startDate: start_date,
    timestamp: {
      createdAt: created_at,
      modifiedAt: modified_at
    },
    type
  }
}

export async function addEmploymentRecord(
  connection: PoolConnection,
  input: EmploymentInput,
  person: PersonRecord,
  provider: ProviderRecord,
  collectiveAgreement: CollectiveAgreementRecord
): Promise<EmploymentRecord> {
  const { type, startDate, endDate, averageHours, description } = input

  const ksuid = await KSUID.random()

  const insertResult = await connection.query(
    SQL`
      INSERT INTO employment (
        ksuid,
        person_id,
        provider_id,
        collective_agreement_id,
        type,
        start_date,
        end_date,
        average_hours,
        description
      ) VALUES (
        ${ksuid.string},
        ${person.id},
        ${provider.id},
        ${collectiveAgreement.id},
        ${type},
        ${startDate},
        ${endDate},
        ${averageHours},
        ${description}
      ) RETURNING id
    `
  )

  return tryGetEmploymentRecord(connection, insertResult.rows[0].id)
}

export async function getEmploymentRecordsByProviderPerson(
  connection: PoolConnection,
  providerPerson: ProviderPersonRecord
): Promise<EmploymentRecord[]> {
  const { providerId, personId } = providerPerson

  const result = await connection.query(
    SQL`
      SELECT * FROM employment
      WHERE
        provider_id = ${providerId}
        AND person_id = ${personId}
    `
  )

  return result.rows.map(row => toRecord(row))
}
