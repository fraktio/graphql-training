import KSUID from 'ksuid'

import { BusinessID, ID, Slug } from '@app/common/types'
import { Timestamp } from '@app/date/types'

export interface OrganizationRecord
  extends Readonly<{
    id: ID
    ksuid: KSUID
    name: string
    slug: Slug
    businessId: BusinessID
    addressId: ID
    timestamp: Timestamp
  }> {}
