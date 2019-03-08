import { Maybe, Slug } from '@app/common/types'
import { Context } from '@app/graphql/types'
import { getOrganizationBySlug } from '@app/organization/organizationService'
import { OrganizationRecord } from '@app/organization/types'
import { getProvidersByOrganization } from '@app/provider/providerService'
import { ProviderRecord } from '@app/provider/types'
import { transaction } from '@app/util/database'
import { Root } from './types'

export const organizationResolvers = {
  Organization: {
    async providers(
      organization: OrganizationRecord,
      _: {},
      { loaderFactories: { providerByKsuidLoaderFactory } }: Context
    ): Promise<ProviderRecord[]> {
      return transaction(async client => {
        return getProvidersByOrganization(
          providerByKsuidLoaderFactory.getLoader(client),
          client,
          organization
        )
      })
    }
  },

  Query: {
    async organization(
      _: Root,
      args: { slug: Slug },
      { loaderFactories: { organizationBySlugLoaderFactory, organizationLoaderFactory } }: Context
    ): Promise<Maybe<OrganizationRecord>> {
      return transaction(async client => {
        return getOrganizationBySlug(
          organizationBySlugLoaderFactory.getLoader(client),
          organizationLoaderFactory.getLoader(client),
          args.slug
        )
      })
    }
  }
}
