import { ID, Maybe } from '@app/common/types'

import { CompanyRecord } from '@app/company/types'
import DataLoader from 'dataloader'
import KSUID from 'ksuid'

export interface CompanyLoaders
  extends Readonly<{
    companyLoader: CompanyLoader
    companyByKsuidLoader: CompanyByKsuidLoader
    companiesByEmployeeLoader: CompaniesByEmployeeLoader
  }> {}

export type CompanyLoader = DataLoader<ID, Maybe<CompanyRecord>>
export type CompanyByKsuidLoader = DataLoader<KSUID, Maybe<CompanyRecord>>
export type CompaniesByEmployeeLoader = DataLoader<ID, Array<CompanyRecord>>
