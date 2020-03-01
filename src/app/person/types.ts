import {
  CountryCode,
  Email,
  ID,
  Language,
  Maybe,
  PersonalIdentityCode,
  Phone
} from '@app/common/types'

import KSUID from 'ksuid'
import { Timestamp } from '@app/date/types'

export interface PersonRecord
  extends Readonly<{
    id: ID
    ksuid: KSUID
    firstName: string
    lastName: string
    personalIdentityCode: PersonalIdentityCode
    phone: Maybe<Phone>
    email: Maybe<Email>
    nationality: CountryCode
    languages: Language[]
    birthDay: Date
    timestamp: Timestamp
  }> {}

export interface AddPersonInput
  extends Readonly<{
    person: PersonInput
  }> {}

interface PersonInput
  extends Readonly<{
    firstName: string
    lastName: string
    personalIdentityCode: PersonalIdentityCode
    phone: Maybe<Phone>
    email: Email
    nationality: CountryCode
    languages: Language[]
    birthDay: Date
  }> {}

export interface EditPersonInput
  extends Readonly<{
    ksuid: KSUID
    person: PersonInput
  }> {}

export interface PersonByEmployerRecord
  extends Readonly<{
    companyId: ID
    person: PersonRecord
  }> {}
