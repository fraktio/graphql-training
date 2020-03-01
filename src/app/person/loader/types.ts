import { ID, Maybe } from '@app/common/types'

import { CompanyRecord } from '@app/company/types'
import DataLoader from 'dataloader'
import KSUID from 'ksuid'
import { PersonRecord } from '@app/person/types'

export interface PersonLoaders
  extends Readonly<{
    personLoader: PersonLoader
    personByKsuidLoader: PersonByKsuidLoader
    personsByEmployerLoader: PersonsByEmployerLoader
  }> {}

export type PersonLoader = DataLoader<ID, Maybe<PersonRecord>>
export type PersonByKsuidLoader = DataLoader<KSUID, Maybe<PersonRecord>>
export type PersonsByEmployerLoader = DataLoader<ID, Array<PersonRecord>>
