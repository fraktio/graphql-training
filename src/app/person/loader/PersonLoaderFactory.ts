import { PersonByKsuidLoader, PersonLoader, PersonLoaders, PersonsByEmployerLoader } from './types'
import {
  getPersonRecordsByIds,
  getPersonRecordsByKsuids,
  getPersonsByEmployers
} from '@app/person/personRepository'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import DataLoader from 'dataloader'
import { PoolConnection } from '@app/util/database/types'

export class PersonLoaderFactory extends AbstractLoaderFactory<PersonLoaders> {
  protected createLoaders(connection: PoolConnection): PersonLoaders {
    const personLoader: PersonLoader = new DataLoader(async ids => {
      const persons = await getPersonRecordsByIds(connection, ids)

      persons.forEach(person => {
        personByKsuidLoader.prime(person.ksuid, person)
      })

      return ids.map(id => persons.find(person => person.id === id) || null)
    })

    const personByKsuidLoader: PersonByKsuidLoader = new DataLoader(async ksuids => {
      const persons = await getPersonRecordsByKsuids(connection, ksuids)

      persons.forEach(person => {
        personLoader.prime(person.id, person)
      })

      return ksuids.map(ksuid => persons.find(person => person.ksuid.equals(ksuid)) || null)
    })

    const personsByEmployerLoader: PersonsByEmployerLoader = new DataLoader(async companyIds => {
      const personsByEmployers = await getPersonsByEmployers(connection, companyIds)

      personsByEmployers.forEach(employerPerson => {
        personLoader.prime(employerPerson.person.id, employerPerson.person)
        personByKsuidLoader.prime(employerPerson.ksuid, employerPerson.person)
      })

      const persons = companyIds.map(companyId =>
        personsByEmployers.reduce((acc: [], employerPerson) => {
          if (employerPerson.companyId === companyId) {
            acc.push(employerPerson.person)
            return acc
          }
        }, [])
      )
      return persons
    })

    return {
      personByKsuidLoader,
      personLoader,
      personsByEmployerLoader
    }
  }
}
