import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getProviderRecords, getProviderRecordsByKsuids } from '@app/provider/providerRepository'
import { ProviderByKSUIDLoader, ProviderLoader, ProviderLoaders } from './types'

export class ProviderLoaderFactory extends AbstractLoaderFactory<ProviderLoaders> {
  protected createLoaders(client: PoolClient): ProviderLoaders {
    const providerLoader: ProviderLoader = new DataLoader(async ids => {
      const providers = await getProviderRecords(client, ids)

      providers.forEach(provider => providerByKsuidLoader.prime(provider.ksuid, provider))

      return ids.map(id => providers.find(provider => provider.id === id) || null)
    })

    const providerByKsuidLoader: ProviderByKSUIDLoader = new DataLoader(async ksuids => {
      const providers = await getProviderRecordsByKsuids(client, ksuids)

      providers.forEach(provider => providerLoader.prime(provider.id, provider))

      return ksuids.map(ksuid => providers.find(provider => provider.ksuid.equals(ksuid)) || null)
    })

    return {
      providerByKsuidLoader,
      providerLoader
    }
  }
}
