import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getPersons } from '@app/person/personRepository'
import { PersonRecord } from '@app/person/types'

export type PersonLoader = DataLoader<number, PersonRecord | null>

export class PersonLoaderFactory extends AbstractLoaderFactory<PersonLoader> {
  protected createLoader(client: PoolClient): PersonLoader {
    return new DataLoader(async ids => {
      const persons = await getPersons(client, ids)

      return ids.map(id => persons.find(person => person.id === id) || null)
    })
  }
}
