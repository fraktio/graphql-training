import KSUID from 'ksuid'

import { ID, Maybe } from '@app/common/types'
import { Hour, Timestamp } from '@app/date/types'

export enum EmploymentType {
  GENERAL_TERMS = 'GENERAL_TERMS',
  INDEFINITE_FULL_TIME = 'INDEFINITE_FULL_TIME',
  INDEFINITE_PART_TIME = 'INDEFINITE_PART_TIME',
  FIXED_TERM_FULL_TIME = 'FIXED_TERM_FULL_TIME',
  FIXED_TERM_PART_TIME = 'FIXED_TERM_PART_TIME'
}

export interface EmploymentRecord
  extends Readonly<{
    id: ID
    ksuid: KSUID
    personId: ID
    providerId: ID
    collectiveAgreementId: ID
    type: EmploymentType
    startDate: Maybe<Date>
    endDate: Maybe<Date>
    averageHours: Maybe<Hour>
    description: Maybe<string>
    timestamp: Timestamp
  }> {}

export interface AddEmploymentInput
  extends Readonly<{
    providerKsuid: KSUID
    personKsuid: KSUID
    collectiveAgreementKsuid: KSUID
    employment: EmploymentInput
  }> {}

export interface EmploymentInput
  extends Readonly<{
    type: EmploymentType
    startDate: Maybe<Date>
    endDate: Maybe<Date>
    averageHours: Maybe<number>
    description: Maybe<string>
  }> {}
