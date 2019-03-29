import { Maybe, Slug } from '@app/common/types'
import { ProviderRecord } from '@app/provider/types'
import { OrganizationLoader, OrganizationLoaders } from './loader/types'
import { OrganizationRecord } from './types'

export async function getOrganizationBySlug(
  loaders: OrganizationLoaders,
  slug: Slug
): Promise<Maybe<OrganizationRecord>> {
  const { organizationLoader, organizationBySlugLoader } = loaders

  const organization = await organizationBySlugLoader.load(slug)

  if (organization) {
    organizationLoader.prime(organization.id, organization)
  }

  return organization
}

export async function tryGetOrganizationByProvider(
  loader: OrganizationLoader,
  provider: ProviderRecord
): Promise<OrganizationRecord> {
  const organization = await loader.load(provider.organizationId)

  if (!organization) {
    throw new Error(`Organization was expected to be found with id ${provider.organizationId}`)
  }

  return organization
}
