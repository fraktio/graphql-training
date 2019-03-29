import { PoolClient } from 'pg'

import { ProviderPersonRecord } from '@app/provider/types'
import { getEmploymentRecordsByProviderPerson } from './employmentRepository'
import { EmploymentByKSUIDLoader } from './loader/types'
import { EmploymentRecord } from './types'

export async function getEmploymentsByProviderPerson(
  loader: EmploymentByKSUIDLoader,
  client: PoolClient,
  providerPerson: ProviderPersonRecord
): Promise<EmploymentRecord[]> {
  const employments = await getEmploymentRecordsByProviderPerson(client, providerPerson)

  employments.forEach(employment => loader.prime(employment.ksuid, employment))

  return employments
}
