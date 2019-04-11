import DataLoader from 'dataloader'

import { getEmploymentRecords } from '@app/employment/employmentRepository'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { PoolConnection } from '@app/util/database/types'
import { EmploymentByKSUIDLoader } from './types'

export class EmploymentLoaderFactory extends AbstractLoaderFactory<EmploymentByKSUIDLoader> {
  protected createLoaders(connection: PoolConnection): EmploymentByKSUIDLoader {
    return new DataLoader(async ksuids => {
      const employments = await getEmploymentRecords(connection, ksuids)

      return ksuids.map(
        ksuid => employments.find(employment => employment.ksuid.equals(ksuid)) || null
      )
    })
  }
}
