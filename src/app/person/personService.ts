import { AddPersonInput, EditPersonInput, PersonRecord } from '@app/person/types'
import { ID, Maybe, Try } from '@app/common/types'
import {
  PersonByKsuidLoader,
  PersonLoader,
  PersonsByEmployerLoader
} from '@app/person/loader/types'
import { addPersonRecord, editPersonRecord, getPersonRecords } from '@app/person/personRepository'

import KSUID from 'ksuid'
import { PoolConnection } from '@app/util/database/types'
import { UniqueConstraintViolationError } from '@app/util/database'

export async function getPerson(loader: PersonLoader, id: ID): Promise<Maybe<PersonRecord>> {
  return loader.load(id)
}

export async function tryGetPerson(loader: PersonLoader, id: ID): Promise<PersonRecord> {
  const person = await loader.load(id)

  if (!person) {
    throw new Error(`Person was expected to be found with id ${id}`)
  }

  return person
}

export async function tryGetPersonByKsuid(
  personByKsuidLoader: PersonByKsuidLoader,
  ksuid: KSUID
): Promise<PersonRecord> {
  const person = await personByKsuidLoader.load(ksuid)

  if (!person) {
    throw new Error(`Person was expected to be found with ksuid ${ksuid}`)
  }

  return person
}

export async function tryGetPersonsByCompanyId(
  personsByEmployerLoader: PersonsByEmployerLoader,
  companyId: ID
): Promise<PersonRecord[]> {
  const person = await personsByEmployerLoader.load(companyId)

  if (!person) {
    throw new Error(`Person was expected to be found with employer id ${companyId}`)
  }

  return person
}

export async function addPerson(
  connection: PoolConnection,
  input: AddPersonInput
): Promise<Try<PersonRecord, UniqueConstraintViolationError>> {
  return addPersonRecord(connection, input)
}

export async function editPerson(
  loader: PersonLoader,
  connection: PoolConnection,
  person: PersonRecord,
  input: EditPersonInput
): Promise<Try<PersonRecord, UniqueConstraintViolationError>> {
  const result = await editPersonRecord(connection, person, input)

  if (result.success) {
    const editedPerson = result.value
    loader.clear(editedPerson.id).prime(editedPerson.id, editedPerson)
  }

  return result
}

export async function getPersons(
  loader: PersonLoader,
  connection: PoolConnection
): Promise<PersonRecord[]> {
  const persons = await getPersonRecords(connection)

  persons.forEach(person => loader.prime(person.id, person))

  return persons
}
