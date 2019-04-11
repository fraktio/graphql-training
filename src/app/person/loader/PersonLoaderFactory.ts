import DataLoader from 'dataloader'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getPersonRecords } from '@app/person/personRepository'
import { PoolConnection } from '@app/util/database/types'
import { PersonLoader } from './types'

export class PersonLoaderFactory extends AbstractLoaderFactory<PersonLoader> {
  protected createLoaders(connection: PoolConnection): PersonLoader {
    return new DataLoader(async ids => {
      const persons = await getPersonRecords(connection, ids)

      return ids.map(id => persons.find(person => person.id === id) || null)
    })
  }
}
