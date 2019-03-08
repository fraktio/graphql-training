import { Maybe, Slug } from '@app/common/types'
import { getEmploymentsByProviderPerson } from '@app/employment/employmentService'
import { EmploymentRecord } from '@app/employment/types'
import { Context } from '@app/graphql/types'
import { getPersonsByProvider } from '@app/person/personService'
import { ProviderPersonRecord, ProviderRecord } from '@app/provider/types'
import { transaction } from '@app/util/database'
import { tryGetOrganizationByProvider } from '@src/app/organization/organizationService'
import { OrganizationRecord } from '@src/app/organization/types'
import { getProviderByOrganizationSlugAndProviderSlug } from '@src/app/provider/providerService'
import { Root } from './types'

interface ProviderArgs {
  organizationSlug: Slug
  providerSlug: Slug
}

export const providerResolvers = {
  Provider: {
    async providerPersons(
      provider: ProviderRecord,
      _: {},
      { loaderFactories: { personByKsuidLoaderFactory } }: Context
    ): Promise<ProviderPersonRecord[]> {
      return transaction(async client => {
        return (await getPersonsByProvider(
          personByKsuidLoaderFactory.getLoader(client),
          client,
          provider
        )).map(person => ({
          person,
          provider
        }))
      })
    },

    async organization(
      provider: ProviderRecord,
      _: {},
      { loaderFactories: { organizationLoaderFactory } }: Context
    ): Promise<OrganizationRecord> {
      return transaction(async client => {
        return tryGetOrganizationByProvider(organizationLoaderFactory.getLoader(client), provider)
      })
    }
  },

  ProviderPerson: {
    async employments(
      providerPerson: ProviderPersonRecord,
      _: {},
      { loaderFactories: { employmentByKsuidLoaderFactory } }: Context
    ): Promise<EmploymentRecord[]> {
      return transaction(async client => {
        return getEmploymentsByProviderPerson(
          employmentByKsuidLoaderFactory.getLoader(client),
          client,
          providerPerson
        )
      })
    }
  },

  Query: {
    async provider(
      _: Root,
      args: ProviderArgs,
      { loaderFactories: { providerByKsuidLoaderFactory } }: Context
    ): Promise<Maybe<ProviderRecord>> {
      return transaction(async client => {
        return getProviderByOrganizationSlugAndProviderSlug(
          providerByKsuidLoaderFactory.getLoader(client),
          client,
          args.organizationSlug,
          args.providerSlug
        )
      })
    }
  }
}
