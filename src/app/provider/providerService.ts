import KSUID from 'ksuid'

import { ID, Maybe, Slug } from '@app/common/types'
import { OrganizationRecord } from '@app/organization/types'
import { PoolConnection } from '@app/util/database/types'
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
  connection: PoolConnection,
  organizationSlug: Slug,
  providerSlug: Slug
): Promise<Maybe<ProviderRecord>> {
  const provider = await getProviderRecordBySlugs(connection, organizationSlug, providerSlug)

  if (provider) {
    const { providerLoader, providerByKsuidLoader } = loaders

    providerLoader.prime(provider.id, provider)
    providerByKsuidLoader.prime(provider.ksuid, provider)
  }

  return provider
}

export async function getProviderPersonBySlugsAndPersonKsuid(
  connection: PoolConnection,
  organizationSlug: Slug,
  providerSlug: Slug,
  personKsuid: KSUID
): Promise<Maybe<ProviderPersonRecord>> {
  return getProviderPersonRecordBySlugsAndPersonKsuid(
    connection,
    organizationSlug,
    providerSlug,
    personKsuid
  )
}

export async function getProviderPersonByProviderKsuidAndPersonKsuid(
  connection: PoolConnection,
  providerKsuid: KSUID,
  personKsuid: KSUID
): Promise<Maybe<ProviderPersonRecord>> {
  return getProviderPersonRecordByProviderKsuidAndPersonKsuid(
    connection,
    providerKsuid,
    personKsuid
  )
}

export async function getProvidersByOrganization(
  loaders: ProviderLoaders,
  connection: PoolConnection,
  organization: OrganizationRecord
): Promise<ProviderRecord[]> {
  const providers = await getProviderRecordsByOrganization(connection, organization)

  const { providerLoader, providerByKsuidLoader } = loaders

  providers.forEach(provider => {
    providerLoader.prime(provider.id, provider)
    providerByKsuidLoader.prime(provider.ksuid, provider)
  })

  return providers
}
