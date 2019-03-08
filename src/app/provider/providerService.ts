import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { Maybe, Slug } from '@app/common/types'
import { OrganizationRecord } from '@app/organization/types'
import { ProviderByKSUIDLoader } from './providerByKsuidLoader'
import {
  getProviderRecordByOrganizationSlugAndProviderSlug,
  getProviderRecordsByOrganization
} from './providerRepository'
import { ProviderRecord } from './types'

export async function getProvider(
  loader: ProviderByKSUIDLoader,
  ksuid: KSUID
): Promise<Maybe<ProviderRecord>> {
  return loader.load(ksuid)
}

export async function getProviderByOrganizationSlugAndProviderSlug(
  loader: ProviderByKSUIDLoader,
  client: PoolClient,
  organizationSlug: Slug,
  providerSlug: Slug
): Promise<Maybe<ProviderRecord>> {
  const provider = await getProviderRecordByOrganizationSlugAndProviderSlug(
    client,
    organizationSlug,
    providerSlug
  )

  if (provider) {
    loader.prime(provider.ksuid, provider)
  }

  return provider
}

export async function getProvidersByOrganization(
  loader: ProviderByKSUIDLoader,
  client: PoolClient,
  organization: OrganizationRecord
): Promise<ProviderRecord[]> {
  const providers = await getProviderRecordsByOrganization(client, organization)

  providers.forEach(provider => loader.prime(provider.ksuid, provider))

  return providers
}
