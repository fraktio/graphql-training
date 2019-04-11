import DataLoader from 'dataloader'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getProviderRecords, getProviderRecordsByKsuids } from '@app/provider/providerRepository'
import { PoolConnection } from '@app/util/database/types'
import { ProviderByKSUIDLoader, ProviderLoader, ProviderLoaders } from './types'

export class ProviderLoaderFactory extends AbstractLoaderFactory<ProviderLoaders> {
  protected createLoaders(connection: PoolConnection): ProviderLoaders {
    const providerLoader: ProviderLoader = new DataLoader(async ids => {
      const providers = await getProviderRecords(connection, ids)

      providers.forEach(provider => providerByKsuidLoader.prime(provider.ksuid, provider))

      return ids.map(id => providers.find(provider => provider.id === id) || null)
    })

    const providerByKsuidLoader: ProviderByKSUIDLoader = new DataLoader(async ksuids => {
      const providers = await getProviderRecordsByKsuids(connection, ksuids)

      providers.forEach(provider => providerLoader.prime(provider.id, provider))

      return ksuids.map(ksuid => providers.find(provider => provider.ksuid.equals(ksuid)) || null)
    })

    return {
      providerByKsuidLoader,
      providerLoader
    }
  }
}
