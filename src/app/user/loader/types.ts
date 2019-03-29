import DataLoader from 'dataloader'

import { ID, Maybe } from '@app/common/types'
import { UserRecord } from '@app/user/types'

export type UserLoader = DataLoader<ID, Maybe<UserRecord>>
