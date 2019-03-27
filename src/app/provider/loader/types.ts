import DataLoader from 'dataloader'
import KSUID from 'ksuid'

import { ID, Maybe } from '@app/common/types'
import { ProviderRecord } from '@app/provider/types'

export interface ProviderLoaders
  extends Readonly<{
    providerLoader: ProviderLoader
    providerByKsuidLoader: ProviderByKSUIDLoader
  }> {}

export type ProviderLoader = DataLoader<ID, Maybe<ProviderRecord>>
export type ProviderByKSUIDLoader = DataLoader<KSUID, Maybe<ProviderRecord>>
