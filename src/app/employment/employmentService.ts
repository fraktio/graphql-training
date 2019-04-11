import { ProviderPersonRecord } from '@app/provider/types'
import { PoolConnection } from '@app/util/database/types'
import { getEmploymentRecordsByProviderPerson } from './employmentRepository'
import { EmploymentByKSUIDLoader } from './loader/types'
import { EmploymentRecord } from './types'

export async function getEmploymentsByProviderPerson(
  loader: EmploymentByKSUIDLoader,
  connection: PoolConnection,
  providerPerson: ProviderPersonRecord
): Promise<EmploymentRecord[]> {
  const employments = await getEmploymentRecordsByProviderPerson(connection, providerPerson)

  employments.forEach(employment => loader.prime(employment.ksuid, employment))

  return employments
}
