import KSUID from 'ksuid'

import { AddressInput } from '@app/address/types'
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

export interface EditOrganizationInput
  extends Readonly<{
    ksuid: KSUID
    organization: OrganizationInput
  }> {}

interface OrganizationInput
  extends Readonly<{
    businessId: BusinessID
    name: string
    slug: Slug
    address: AddressInput
  }> {}
