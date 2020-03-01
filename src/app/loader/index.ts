import { CompanyLoaderFactory } from '@app/company/loader'
import { PersonLoaderFactory } from '@app/person/loader'

export interface LoaderFactories {
  personLoaderFactory: PersonLoaderFactory
  companyLoaderFactory: CompanyLoaderFactory
}

export function createLoaderFactories(): LoaderFactories {
  return {
    personLoaderFactory: new PersonLoaderFactory(),
    companyLoaderFactory: new CompanyLoaderFactory()
  }
}
