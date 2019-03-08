import KSUID from 'ksuid'

import { AddressInput, Email, Phone } from '@app/address/types'
import { ID, Maybe } from '@app/common/types'
import { Timestamp } from '@app/date/types'
import { EmploymentInput } from '@app/employment/types'
import { BIC, Currency, IBAN } from '@app/finance/types'

export enum UILanguage {
  FI = 'FI'
}

export enum Language {
  EN = 'EN',
  FI = 'FI',
  SE = 'SE'
}

export type PersonalIdentityCode = string

export type Nationality = string

export interface PersonRecord
  extends Readonly<{
    id: ID
    ksuid: KSUID
    userAccountId: ID
    addressId: ID
    firstName: string
    lastName: string
    nickName: Maybe<string>
    personalIdentityCode: PersonalIdentityCode
    phone: Maybe<Phone>
    nationality: Nationality
    iban: Maybe<IBAN>
    bankAccountIsShared: boolean
    bic: Maybe<BIC>
    desiredSalary: Maybe<Currency>
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
    nationality: Nationality
    iban: Maybe<IBAN>
    bankAccountIsShared: boolean
    bic: Maybe<BIC>
    desiredSalary: Maybe<Currency>
    preferredWorkingAreas: string[]
    languages: Language[]
    limitations: Maybe<string>
    personEmployment: PersonEmploymentInput
  }> {}

interface PersonEmploymentInput
  extends Readonly<{
    collectiveAgreementKsuid: KSUID
    employment: EmploymentInput
  }> {}
