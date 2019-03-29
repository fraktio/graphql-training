import { AddressLoaderFactory } from '@app/address/loader'
import { CollectiveAgreementLoaderFactory } from '@app/collective-agreement/loader'
import { EmploymentLoaderFactory } from '@app/employment/loader'
import { OrganizationLoaderFactory } from '@app/organization/loader'
import { PersonLoaderFactory } from '@app/person/loader'
import { ProviderLoaderFactory } from '@app/provider/loader'
import { UserLoaderFactory } from '@app/user/loader'

export interface LoaderFactories {
  addressLoaderFactory: AddressLoaderFactory
  collectiveAgreementLoaderFactory: CollectiveAgreementLoaderFactory
  employmentLoaderFactory: EmploymentLoaderFactory
  organizationLoaderFactory: OrganizationLoaderFactory
  personLoaderFactory: PersonLoaderFactory
  providerLoaderFactory: ProviderLoaderFactory
  userLoaderFactory: UserLoaderFactory
}

export function createLoaderFactories(): LoaderFactories {
  return {
    addressLoaderFactory: new AddressLoaderFactory(),
    collectiveAgreementLoaderFactory: new CollectiveAgreementLoaderFactory(),
    employmentLoaderFactory: new EmploymentLoaderFactory(),
    organizationLoaderFactory: new OrganizationLoaderFactory(),
    personLoaderFactory: new PersonLoaderFactory(),
    providerLoaderFactory: new ProviderLoaderFactory(),
    userLoaderFactory: new UserLoaderFactory()
  }
}
