import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { getEmploymentRecords } from '@app/employment/employmentRepository'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { EmploymentByKSUIDLoader } from './types'

export class EmploymentLoaderFactory extends AbstractLoaderFactory<EmploymentByKSUIDLoader> {
  protected createLoaders(client: PoolClient): EmploymentByKSUIDLoader {
    return new DataLoader(async ksuids => {
      const employments = await getEmploymentRecords(client, ksuids)

      return ksuids.map(
        ksuid => employments.find(employment => employment.ksuid.equals(ksuid)) || null
      )
    })
  }
}
