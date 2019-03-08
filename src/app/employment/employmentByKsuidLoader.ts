import DataLoader from 'dataloader'
import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { Maybe } from '@app/common/types'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getEmploymentRecords } from './employmentRepository'
import { EmploymentRecord } from './types'

export type EmploymentByKSUIDLoader = DataLoader<KSUID, Maybe<EmploymentRecord>>

export class EmploymentByKSUIDLoaderFactory extends AbstractLoaderFactory<EmploymentByKSUIDLoader> {
  protected createLoader(client: PoolClient): EmploymentByKSUIDLoader {
    return new DataLoader(async ksuids => {
      const employments = await getEmploymentRecords(client, ksuids)

      return ksuids.map(
        ksuid => employments.find(employment => employment.ksuid.equals(ksuid)) || null
      )
    })
  }
}
