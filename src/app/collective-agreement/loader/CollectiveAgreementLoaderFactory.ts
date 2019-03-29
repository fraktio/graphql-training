import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { getCollectiveAgreementRecords } from '@app/collective-agreement/collectiveAgreementRepository'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { CollectiveAgreementByKSUIDLoader } from './types'

export class CollectiveAgreementLoaderFactory extends AbstractLoaderFactory<
  CollectiveAgreementByKSUIDLoader
> {
  protected createLoaders(client: PoolClient): CollectiveAgreementByKSUIDLoader {
    return new DataLoader(async ksuids => {
      const collectiveAgreements = await getCollectiveAgreementRecords(client, ksuids)

      return ksuids.map(
        ksuid =>
          collectiveAgreements.find(collectiveAgreement =>
            collectiveAgreement.ksuid.equals(ksuid)
          ) || null
      )
    })
  }
}
