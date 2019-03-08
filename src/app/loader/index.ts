import { AddressLoaderFactory } from '@app/address/addressLoader'
import { OrganizationBySlugLoaderFactory } from '@app/organization/organizationBySlugLoader'
import { OrganizationLoaderFactory } from '@app/organization/organizationLoader'
import { UserLoaderFactory } from '@app/user/userLoader'
import { CollectiveAgreementByKSUIDLoaderFactory } from '@src/app/collective-agreement/collectiveAgreementByKsuidLoader'
import { EmploymentByKSUIDLoaderFactory } from '@src/app/employment/employmentByKsuidLoader'
import { PersonByKSUIDLoaderFactory } from '@src/app/person/personByKsuidLoader'
import { ProviderByKSUIDLoaderFactory } from '@src/app/provider/providerByKsuidLoader'

export interface LoaderFactories {
  addressLoaderFactory: AddressLoaderFactory
  collectiveAgreementByKsuidLoaderFactory: CollectiveAgreementByKSUIDLoaderFactory
  employmentByKsuidLoaderFactory: EmploymentByKSUIDLoaderFactory
  organizationBySlugLoaderFactory: OrganizationBySlugLoaderFactory
  organizationLoaderFactory: OrganizationLoaderFactory
  personByKsuidLoaderFactory: PersonByKSUIDLoaderFactory
  providerByKsuidLoaderFactory: ProviderByKSUIDLoaderFactory
  userLoaderFactory: UserLoaderFactory
}

export function createLoaderFactories(): LoaderFactories {
  return {
    addressLoaderFactory: new AddressLoaderFactory(),
    collectiveAgreementByKsuidLoaderFactory: new CollectiveAgreementByKSUIDLoaderFactory(),
    employmentByKsuidLoaderFactory: new EmploymentByKSUIDLoaderFactory(),
    organizationBySlugLoaderFactory: new OrganizationBySlugLoaderFactory(),
    organizationLoaderFactory: new OrganizationLoaderFactory(),
    personByKsuidLoaderFactory: new PersonByKSUIDLoaderFactory(),
    providerByKsuidLoaderFactory: new ProviderByKSUIDLoaderFactory(),
    userLoaderFactory: new UserLoaderFactory()
  }
}
