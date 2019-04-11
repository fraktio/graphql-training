import DataLoader from 'dataloader'

import { getCollectiveAgreementRecords } from '@app/collective-agreement/collectiveAgreementRepository'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { PoolConnection } from '@app/util/database/types'
import { CollectiveAgreementByKSUIDLoader } from './types'

export class CollectiveAgreementLoaderFactory extends AbstractLoaderFactory<
  CollectiveAgreementByKSUIDLoader
> {
  protected createLoaders(connection: PoolConnection): CollectiveAgreementByKSUIDLoader {
    return new DataLoader(async ksuids => {
      const collectiveAgreements = await getCollectiveAgreementRecords(connection, ksuids)

      return ksuids.map(
        ksuid =>
          collectiveAgreements.find(collectiveAgreement =>
            collectiveAgreement.ksuid.equals(ksuid)
          ) || null
      )
    })
  }
}
