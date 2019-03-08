import DataLoader from 'dataloader'
import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { Maybe } from '@app/common/types'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getPersonRecords } from './personRepository'
import { PersonRecord } from './types'

export type PersonByKSUIDLoader = DataLoader<KSUID, Maybe<PersonRecord>>

export class PersonByKSUIDLoaderFactory extends AbstractLoaderFactory<PersonByKSUIDLoader> {
  protected createLoader(client: PoolClient): PersonByKSUIDLoader {
    return new DataLoader(async ksuids => {
      const persons = await getPersonRecords(client, ksuids)

      return ksuids.map(ksuid => persons.find(person => person.ksuid.equals(ksuid)) || null)
    })
  }
}
