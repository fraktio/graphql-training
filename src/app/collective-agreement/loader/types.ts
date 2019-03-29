import DataLoader from 'dataloader'
import KSUID from 'ksuid'

import { CollectiveAgreementRecord } from '@app/collective-agreement/types'
import { Maybe } from '@app/common/types'

export type CollectiveAgreementByKSUIDLoader = DataLoader<KSUID, Maybe<CollectiveAgreementRecord>>
