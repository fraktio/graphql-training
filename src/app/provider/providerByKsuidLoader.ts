import DataLoader from 'dataloader'
import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { Maybe } from '@app/common/types'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getProviderRecords } from './providerRepository'
import { ProviderRecord } from './types'

export type ProviderByKSUIDLoader = DataLoader<KSUID, Maybe<ProviderRecord>>

export class ProviderByKSUIDLoaderFactory extends AbstractLoaderFactory<ProviderByKSUIDLoader> {
  protected createLoader(client: PoolClient): ProviderByKSUIDLoader {
    return new DataLoader(async ksuids => {
      const providers = await getProviderRecords(client, ksuids)

      return ksuids.map(ksuid => providers.find(provider => provider.ksuid.equals(ksuid)) || null)
    })
  }
}
