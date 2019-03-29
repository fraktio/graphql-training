import DataLoader from 'dataloader'

import { AddressRecord } from '@app/address/types'
import { ID, Maybe } from '@app/common/types'

export type AddressLoader = DataLoader<ID, Maybe<AddressRecord>>
