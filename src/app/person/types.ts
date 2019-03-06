import KSUID from 'ksuid'

import { AddressInput, Email, Phone } from '@app/address/types'
import { Timestamp } from '@app/date/types'
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
    ksuid: KSUID
    userAccountId: number
    addressId: number
    firstName: string
    lastName: string
    nickName: string | null
    personalIdentityCode: PersonalIdentityCode
    phone: Phone | null
    nationality: Nationality
    iban: IBAN | null
    bankAccountIsShared: boolean
    bic: BIC | null
    desiredSalary: Currency | null
    preferredWorkingAreas: string[]
    languages: Language[]
    limitations: string | null
    uiLanguage: UILanguage
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
    nickName: string | null
    personalIdentityCode: PersonalIdentityCode
    phone: Phone | null
    email: Email
    address: AddressInput
    nationality: Nationality
    iban: IBAN | null
    bankAccountIsShared: boolean
    bic: BIC | null
    desiredSalary: Currency | null
    preferredWorkingAreas: string[]
    languages: Language[]
    limitations: string | null
  }> {}
