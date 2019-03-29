import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { AddressLoader } from '@app/address/loader/types'
import { CollectiveAgreementRecord } from '@app/collective-agreement/types'
import { ID, Maybe, Try } from '@app/common/types'
import { PersonLoader } from '@app/person/loader/types'
import {
  addPersonRecord,
  editPersonRecord,
  getPersonRecordByKsuid,
  getPersonRecordsByProvider
} from '@app/person/personRepository'
import { AddPersonInput, EditPersonInput, PersonRecord } from '@app/person/types'
import { ProviderPersonRecord, ProviderRecord } from '@app/provider/types'
import { UserLoader } from '@app/user/loader/types'
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

export async function getPersonByKsuid(
  loader: PersonLoader,
  client: PoolClient,
  ksuid: KSUID
): Promise<Maybe<PersonRecord>> {
  const person = await getPersonRecordByKsuid(client, ksuid)

  if (person) {
    loader.prime(person.id, person)
  }

  return person
}

export async function addPerson(
  client: PoolClient,
  input: AddPersonInput,
  provider: ProviderRecord,
  collectiveAgreement: CollectiveAgreementRecord
): Promise<Try<PersonRecord, UniqueConstraintViolationError>> {
  return addPersonRecord(client, input, provider, collectiveAgreement)
}

export async function editPerson(
  loader: PersonLoader,
  addressLoader: AddressLoader,
  userLoader: UserLoader,
  client: PoolClient,
  person: PersonRecord,
  input: EditPersonInput
): Promise<Try<PersonRecord, UniqueConstraintViolationError>> {
  const result = await editPersonRecord(client, person, input)

  if (result.success) {
    const editedPerson = result.value

    loader.clear(editedPerson.id).prime(editedPerson.id, editedPerson)
    addressLoader.clear(editedPerson.addressId)
    userLoader.clear(editedPerson.userId)
  }

  return result
}

export async function getPersonsByProvider(
  loader: PersonLoader,
  client: PoolClient,
  provider: ProviderRecord
): Promise<PersonRecord[]> {
  const persons = await getPersonRecordsByProvider(client, provider)

  persons.forEach(person => loader.prime(person.id, person))

  return persons
}

export async function tryGetPersonByProviderPerson(
  loader: PersonLoader,
  providerPerson: ProviderPersonRecord
): Promise<PersonRecord> {
  const person = await loader.load(providerPerson.personId)

  if (!person) {
    throw new Error(`Person was expected to be found with id ${providerPerson.personId}`)
  }

  return person
}
