import KSUID from 'ksuid'

import { Maybe } from '@app/common/types'
import { PoolConnection } from '@app/util/database/types'
import { getAllCollectiveAgreementRecords } from './collectiveAgreementRepository'
import { CollectiveAgreementByKSUIDLoader } from './loader/types'
import { CollectiveAgreementRecord } from './types'

export async function getCollectiveAgreement(
  loader: CollectiveAgreementByKSUIDLoader,
  ksuid: KSUID
): Promise<Maybe<CollectiveAgreementRecord>> {
  return loader.load(ksuid)
}

export async function getAllCollectiveAgreements(
  loader: CollectiveAgreementByKSUIDLoader,
  connection: PoolConnection
): Promise<CollectiveAgreementRecord[]> {
  const collectiveAgreements = await getAllCollectiveAgreementRecords(connection)

  collectiveAgreements.forEach(collectiveAgreement =>
    loader.prime(collectiveAgreement.ksuid, collectiveAgreement)
  )

  return collectiveAgreements
}
