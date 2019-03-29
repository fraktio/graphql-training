import DataLoader from 'dataloader'

import { ID, Maybe } from '@app/common/types'
import { PersonRecord } from '@app/person/types'

export type PersonLoader = DataLoader<ID, Maybe<PersonRecord>>
