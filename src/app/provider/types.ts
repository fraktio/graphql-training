import KSUID from 'ksuid'

import { BusinessID, ID, Slug } from '@app/common/types'
import { Timestamp } from '@app/date/types'
import { PersonRecord } from '@app/person/types'

export interface ProviderRecord
  extends Readonly<{
    id: ID
    ksuid: KSUID
    slug: Slug
    name: string
    businessId: BusinessID
    addressId: ID
    organizationId: ID
    timestamp: Timestamp
  }> {}

export interface ProviderPersonRecord
  extends Readonly<{
    provider: ProviderRecord
    person: PersonRecord
  }> {}
