import KSUID from 'ksuid'

import { ID } from '@app/common/types'
import { Timestamp } from '@app/date/types'

export interface CollectiveAgreementRecord
  extends Readonly<{
    id: ID
    ksuid: KSUID
    name: string
    timestamp: Timestamp
  }> {}
