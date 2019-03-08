import { Maybe, Slug } from '@app/common/types'
import { ProviderRecord } from '@app/provider/types'
import { OrganizationBySlugLoader } from './organizationBySlugLoader'
import { OrganizationLoader } from './organizationLoader'
import { OrganizationRecord } from './types'

export async function getOrganizationBySlug(
  bySlugLoader: OrganizationBySlugLoader,
  loader: OrganizationLoader,
  slug: Slug
): Promise<Maybe<OrganizationRecord>> {
  const organization = await bySlugLoader.load(slug)

  if (organization) {
    loader.prime(organization.id, organization)
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
