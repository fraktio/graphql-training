import DataLoader from 'dataloader'
import KSUID from 'ksuid'

import { Maybe } from '@app/common/types'
import { EmploymentRecord } from '@app/employment/types'

export type EmploymentByKSUIDLoader = DataLoader<KSUID, Maybe<EmploymentRecord>>
