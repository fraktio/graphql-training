import DataLoader from 'dataloader'
import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { Maybe } from '@app/common/types'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getCollectiveAgreementRecords } from './collectiveAgreementRepository'
import { CollectiveAgreementRecord } from './types'

export type CollectiveAgreementByKSUIDLoader = DataLoader<KSUID, Maybe<CollectiveAgreementRecord>>

export class CollectiveAgreementByKSUIDLoaderFactory extends AbstractLoaderFactory<
  CollectiveAgreementByKSUIDLoader
> {
  protected createLoader(client: PoolClient): CollectiveAgreementByKSUIDLoader {
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
