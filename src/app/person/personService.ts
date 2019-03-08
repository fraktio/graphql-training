import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { CollectiveAgreementRecord } from '@app/collective-agreement/types'
import { Maybe } from '@app/common/types'
import {
  addPersonRecord,
  getAllPersonRecords,
  getPersonRecordsByProvider
} from '@app/person/personRepository'
import { AddPersonInput, PersonRecord } from '@app/person/types'
import { ProviderRecord } from '@app/provider/types'
import { UniqueConstraintViolationError } from '@app/util/database'
import { PersonByKSUIDLoader } from '@src/app/person/personByKsuidLoader'

export async function getAllPersons(
  loader: PersonByKSUIDLoader,
  client: PoolClient
): Promise<PersonRecord[]> {
  const persons = await getAllPersonRecords(client)

  persons.forEach(person => loader.prime(person.ksuid, person))

  return persons
}

export async function getPerson(
  loader: PersonByKSUIDLoader,
  ksuid: KSUID
): Promise<Maybe<PersonRecord>> {
  return loader.load(ksuid)
}

export async function addPerson(
  client: PoolClient,
  input: AddPersonInput,
  provider: ProviderRecord,
  collectiveAgreement: CollectiveAgreementRecord
): Promise<PersonRecord | UniqueConstraintViolationError> {
  return addPersonRecord(client, input, provider, collectiveAgreement)
}

export async function getPersonsByProvider(
  loader: PersonByKSUIDLoader,
  client: PoolClient,
  provider: ProviderRecord
): Promise<PersonRecord[]> {
  const persons = await getPersonRecordsByProvider(client, provider)

  persons.forEach(person => loader.prime(person.ksuid, person))

  return persons
}
