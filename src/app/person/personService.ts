import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { PersonLoader } from '@app/person/personLoader'
import {
  addPerson as repositoryAddPerson,
  getAllPersons as repositoryGetAllPersons
} from '@app/person/personRepository'
import { AddPersonInput, PersonRecord } from '@app/person/types'
import { UniqueConstraintViolationError } from '@app/util/database'

export async function getAllPersons(
  loader: PersonLoader,
  client: PoolClient
): Promise<PersonRecord[]> {
  const persons = await repositoryGetAllPersons(client)

  persons.forEach(person => loader.prime(person.ksuid, person))

  return persons
}

export async function getPerson(loader: PersonLoader, ksuid: KSUID): Promise<PersonRecord | null> {
  return loader.load(ksuid)
}

export async function addPerson(
  client: PoolClient,
  input: AddPersonInput
): Promise<PersonRecord | UniqueConstraintViolationError> {
  return repositoryAddPerson(client, input)
}
