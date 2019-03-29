import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { ID, Maybe, Slug } from '@app/common/types'
import { OrganizationRecord } from '@app/organization/types'
import { ProviderByKSUIDLoader, ProviderLoader, ProviderLoaders } from './loader/types'
import {
  getProviderPersonRecordByProviderKsuidAndPersonKsuid,
  getProviderPersonRecordBySlugsAndPersonKsuid,
  getProviderRecordBySlugs,
  getProviderRecordsByOrganization
} from './providerRepository'
import { ProviderPersonRecord, ProviderRecord } from './types'

export async function getProviderByKsuid(
  loader: ProviderByKSUIDLoader,
  ksuid: KSUID
): Promise<Maybe<ProviderRecord>> {
  return loader.load(ksuid)
}

export async function tryGetProvider(loader: ProviderLoader, id: ID): Promise<ProviderRecord> {
  const provider = await loader.load(id)

  if (!provider) {
    throw new Error(`Provider was expected to be found with id ${id}`)
  }

  return provider
}

export async function getProviderBySlugs(
  loaders: ProviderLoaders,
  client: PoolClient,
  organizationSlug: Slug,
  providerSlug: Slug
): Promise<Maybe<ProviderRecord>> {
  const provider = await getProviderRecordBySlugs(client, organizationSlug, providerSlug)

  if (provider) {
    const { providerLoader, providerByKsuidLoader } = loaders

    providerLoader.prime(provider.id, provider)
    providerByKsuidLoader.prime(provider.ksuid, provider)
  }

  return provider
}

export async function getProviderPersonBySlugsAndPersonKsuid(
  client: PoolClient,
  organizationSlug: Slug,
  providerSlug: Slug,
  personKsuid: KSUID
): Promise<Maybe<ProviderPersonRecord>> {
  return getProviderPersonRecordBySlugsAndPersonKsuid(
    client,
    organizationSlug,
    providerSlug,
    personKsuid
  )
}

export async function getProviderPersonByProviderKsuidAndPersonKsuid(
  client: PoolClient,
  providerKsuid: KSUID,
  personKsuid: KSUID
): Promise<Maybe<ProviderPersonRecord>> {
  return getProviderPersonRecordByProviderKsuidAndPersonKsuid(client, providerKsuid, personKsuid)
}

export async function getProvidersByOrganization(
  loaders: ProviderLoaders,
  client: PoolClient,
  organization: OrganizationRecord
): Promise<ProviderRecord[]> {
  const providers = await getProviderRecordsByOrganization(client, organization)

  const { providerLoader, providerByKsuidLoader } = loaders

  providers.forEach(provider => {
    providerLoader.prime(provider.id, provider)
    providerByKsuidLoader.prime(provider.ksuid, provider)
  })

  return providers
}
