import KSUID from 'ksuid'

import { AddressInput, CountryCode, Email, Phone } from '@app/address/types'
import { ID, Maybe } from '@app/common/types'
import { Timestamp } from '@app/date/types'
import { EmploymentInput } from '@app/employment/types'
import { BIC, IBAN, Money } from '@app/finance/types'
import { UILanguage } from '@app/user/types'

export enum Language {
  EN = 'EN',
  FI = 'FI',
  SE = 'SE'
}

export interface PersonalIdentityCode extends String {
  _personalIdentityCode: never
}

export interface PersonRecord
  extends Readonly<{
    id: ID
    ksuid: KSUID
    userId: ID
    addressId: ID
    firstName: string
    lastName: string
    nickName: Maybe<string>
    personalIdentityCode: PersonalIdentityCode
    phone: Maybe<Phone>
    nationality: CountryCode
    iban: Maybe<IBAN>
    bankAccountIsShared: boolean
    bic: Maybe<BIC>
    desiredSalary: Maybe<Money>
    preferredWorkingAreas: string[]
    languages: Language[]
    limitations: Maybe<string>
    uiLanguage: UILanguage
    timestamp: Timestamp
  }> {}

export interface AddPersonInput
  extends Readonly<{
    providerKsuid: KSUID
    person: PersonInput
    personEmployment: PersonEmploymentInput
  }> {}

interface PersonInput
  extends Readonly<{
    firstName: string
    lastName: string
    nickName: Maybe<string>
    personalIdentityCode: PersonalIdentityCode
    phone: Maybe<Phone>
    email: Email
    address: AddressInput
    nationality: CountryCode
    iban: Maybe<IBAN>
    bankAccountIsShared: boolean
    bic: Maybe<BIC>
    desiredSalary: Maybe<Money>
    preferredWorkingAreas: string[]
    languages: Language[]
    limitations: Maybe<string>
  }> {}

interface PersonEmploymentInput
  extends Readonly<{
    collectiveAgreementKsuid: KSUID
    employment: EmploymentInput
  }> {}

export interface EditPersonInput
  extends Readonly<{
    ksuid: KSUID
    providerKsuid: KSUID
    person: PersonInput
  }> {}
