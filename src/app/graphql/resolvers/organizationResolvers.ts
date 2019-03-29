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
      { loaderFactories: { providerLoaderFactory } }: Context
    ): Promise<ProviderRecord[]> {
      return transaction(async client => {
        return getProvidersByOrganization(
          providerLoaderFactory.getLoaders(client),
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
      { loaderFactories: { organizationLoaderFactory } }: Context
    ): Promise<Maybe<OrganizationRecord>> {
      return transaction(async client => {
        return getOrganizationBySlug(organizationLoaderFactory.getLoaders(client), args.slug)
      })
    }
  }
}
