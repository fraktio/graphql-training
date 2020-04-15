import {
  AddCompanyInput,
  AddEmployeeRecordInput,
  AddPersonToCompanyEmployeeInput,
  CompanyRecord,
  EditCompanyInput,
  EmployeeDoesNotExistInCompanyError,
  RemoveEmployeeRecordFromCompanyInput
} from '@app/company/types'
import {
  CompaniesByEmployeeLoader,
  CompanyByKsuidLoader,
  CompanyLoader
} from '@app/company/loader/types'
import { ID, Maybe, Try } from '@app/common/types'
import {
  addCompanyRecord,
  editCompanyRecord,
  getCompanyRecords
} from '@app/company/companyRepository'
import {
  addEmployeeRecord,
  removeEmployeeRecordFromCompany
} from '@app/company/employmentRepository'

import KSUID from 'ksuid'
import { PersonsByEmployerLoader } from '@app/person/loader/types'
import { PoolConnection } from '@app/util/database/types'
import { UniqueConstraintViolationError } from '@app/util/database'

export async function getCompany(loader: CompanyLoader, id: ID): Promise<Maybe<CompanyRecord>> {
  return loader.load(id)
}

export async function tryGetCompany(loader: CompanyLoader, id: ID): Promise<CompanyRecord> {
  const company = await loader.load(id)

  if (!company) {
    throw new Error(`Company was expected to be found with id ${id}`)
  }

  return company
}

export async function tryGetCompanyByKsuid(
  companyByKsuidLoader: CompanyByKsuidLoader,
  ksuid: KSUID
): Promise<CompanyRecord> {
  const company = await companyByKsuidLoader.load(ksuid)

  if (!company) {
    throw new Error(`Company was expected to be found with ksuid ${ksuid}`)
  }

  return company
}

export async function addCompany(
  connection: PoolConnection,
  input: AddCompanyInput
): Promise<Try<CompanyRecord, UniqueConstraintViolationError>> {
  return addCompanyRecord(connection, input)
}

export async function editCompany(
  loader: CompanyLoader,
  connection: PoolConnection,
  company: CompanyRecord,
  input: EditCompanyInput
): Promise<Try<CompanyRecord, UniqueConstraintViolationError>> {
  const result = await editCompanyRecord(connection, company, input)

  if (result.success) {
    const editedCompany = result.value
    loader.clear(editedCompany.id).prime(editedCompany.id, editedCompany)
  }

  return result
}

export async function addPersonToCompanyEmployee(
  personsByEmployerLoader: PersonsByEmployerLoader,
  companiesByEmployeeLoader: CompaniesByEmployeeLoader,
  connection: PoolConnection,
  input: AddEmployeeRecordInput
): Promise<Try<CompanyRecord, UniqueConstraintViolationError>> {
  const result = await addEmployeeRecord(connection, input)

  if (result.success) {
    const companies = await companiesByEmployeeLoader.load(input.person.id)
    const isInCompanyLoader =
      companies.filter(company => {
        return company.ksuid.compare(input.company.ksuid) === 0
      }).length === 1

    if (!isInCompanyLoader) {
      companies.push(input.company)
      companiesByEmployeeLoader.clear(input.person.id).prime(input.person.id, companies)
    }

    const persons = await personsByEmployerLoader.load(input.company.id)
    const isInPersonsLoader =
      persons.filter(person => {
        return person.ksuid.compare(input.person.ksuid) === 0
      }).length === 1

    if (!isInPersonsLoader) {
      persons.push(input.person)
      personsByEmployerLoader.clear(input.company.id).prime(input.company.id, persons)
    }

    return { success: true, value: input.company } // vähän ruma
  }

  return result
}

export async function removeEmployeeFromCompanyEmployee(
  personsByEmployerLoader: PersonsByEmployerLoader,
  companiesByEmployeeLoader: CompaniesByEmployeeLoader,
  connection: PoolConnection,
  input: RemoveEmployeeRecordFromCompanyInput
): Promise<Try<CompanyRecord, EmployeeDoesNotExistInCompanyError>> {
  let persons = await personsByEmployerLoader.load(input.company.id)
  const personToBeRemoved = persons.filter(person => {
    return person.ksuid.compare(input.person.ksuid) === 0
  })

  if (personToBeRemoved.length !== 1) {
    return {
      success: false,
      error: new EmployeeDoesNotExistInCompanyError(
        `Person with KSUID: ${input.person.ksuid} not found in company KSUID: ${input.company.ksuid}`
      )
    }
  }

  const result = await removeEmployeeRecordFromCompany(connection, input)

  let companies = await companiesByEmployeeLoader.load(input.person.id)
  companies = companies.filter(company => company.ksuid.compare(input.company.ksuid) === -1)
  companiesByEmployeeLoader.clear(input.person.id).prime(input.person.id, companies)

  persons = persons.filter(person => person.ksuid.compare(input.person.ksuid) === -1)
  personsByEmployerLoader.clear(input.company.id).prime(input.company.id, persons)

  return { success: true, value: input.company }
}

export async function tryGetCompaniesByPersonId(
  companiesByEmployeeLoader: CompaniesByEmployeeLoader,
  personId: ID
): Promise<CompanyRecord[]> {
  const company = await companiesByEmployeeLoader.load(personId)

  if (!company) {
    throw new Error(`Company was expected to be found with employee id ${personId}`)
  }

  return company
}

export async function getCompanies(
  loader: CompanyLoader,
  connection: PoolConnection
): Promise<CompanyRecord[]> {
  const companies = await getCompanyRecords(connection)
  companies.forEach(company => loader.prime(company.id, company))
  return companies
}
