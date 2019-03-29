import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getPersonRecords } from '@app/person/personRepository'
import { PersonLoader } from './types'

export class PersonLoaderFactory extends AbstractLoaderFactory<PersonLoader> {
  protected createLoaders(client: PoolClient): PersonLoader {
    return new DataLoader(async ids => {
      const persons = await getPersonRecords(client, ids)

      return ids.map(id => persons.find(person => person.id === id) || null)
    })
  }
}
