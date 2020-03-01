import {
  CompaniesByEmployeeLoader,
  CompanyByKsuidLoader,
  CompanyLoader,
  CompanyLoaders
} from './types'
import {
  getCompaniesByEmployees,
  getCompanyRecordsByIds,
  getCompanyRecordsByKsuids
} from '@app/company/companyRepository'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import DataLoader from 'dataloader'
import { PoolConnection } from '@app/util/database/types'

export class CompanyLoaderFactory extends AbstractLoaderFactory<CompanyLoaders> {
  protected createLoaders(connection: PoolConnection): CompanyLoaders {
    const companyLoader: CompanyLoader = new DataLoader(async ids => {
      const companies = await getCompanyRecordsByIds(connection, ids)

      companies.forEach(company => {
        companyByKsuidLoader.prime(company.ksuid, company)
      })

      return ids.map(id => companies.find(company => company.id === id) || null)
    })

    const companyByKsuidLoader: CompanyByKsuidLoader = new DataLoader(async ksuids => {
      const companies = await getCompanyRecordsByKsuids(connection, ksuids)

      companies.forEach(company => {
        companyLoader.prime(company.id, company)
      })

      return ksuids.map(ksuid => companies.find(company => company.ksuid.equals(ksuid)) || null)
    })

    const companiesByEmployeeLoader: CompaniesByEmployeeLoader = new DataLoader(async personIds => {
      const companiesByEmployees = await getCompaniesByEmployees(connection, personIds)

      companiesByEmployees.forEach(employmentCompany => {
        companyLoader.prime(employmentCompany.company.id, employmentCompany.company)
        companyByKsuidLoader.prime(employmentCompany.company.ksuid, employmentCompany.company)
      })

      const companies = personIds.map(personId =>
        companiesByEmployees.reduce((acc: [], employmentCompany) => {
          if (employmentCompany.personId === personId) {
            acc.push(employmentCompany.company)
            return acc
          }
        }, [])
      )

      return companies
    })

    return {
      companyByKsuidLoader,
      companyLoader,
      companiesByEmployeeLoader
    }
  }
}
