import KSUID from 'ksuid'
import { PoolClient } from 'pg'

import { Maybe } from '@app/common/types'
import { CollectiveAgreementByKSUIDLoader } from './collectiveAgreementByKsuidLoader'
import { getAllCollectiveAgreementRecords } from './collectiveAgreementRepository'
import { CollectiveAgreementRecord } from './types'

export async function getCollectiveAgreement(
  loader: CollectiveAgreementByKSUIDLoader,
  ksuid: KSUID
): Promise<Maybe<CollectiveAgreementRecord>> {
  return loader.load(ksuid)
}

export async function getAllCollectiveAgreements(
  loader: CollectiveAgreementByKSUIDLoader,
  client: PoolClient
): Promise<CollectiveAgreementRecord[]> {
  const collectiveAgreements = await getAllCollectiveAgreementRecords(client)

  collectiveAgreements.forEach(collectiveAgreement =>
    loader.prime(collectiveAgreement.ksuid, collectiveAgreement)
  )

  return collectiveAgreements
}
