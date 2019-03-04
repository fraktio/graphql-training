import DataLoader from 'dataloader'
import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getPersons } from '@app/person/personRepository'
import { PersonRecord } from '@app/person/types'

export type PersonLoader = DataLoader<KSUID, PersonRecord | null>

export class PersonLoaderFactory extends AbstractLoaderFactory<PersonLoader> {
  protected createLoader(client: PoolClient): PersonLoader {
    return new DataLoader(async ksuids => {
      const persons = await getPersons(client, ksuids)

      return ksuids.map(ksuid => persons.find(person => person.ksuid.equals(ksuid)) || null)
    })
  }
}
