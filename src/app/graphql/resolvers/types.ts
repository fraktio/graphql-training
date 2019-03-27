import KSUID from 'ksuid'

import { Maybe } from '@app/common/types'

export type Root = typeof undefined

export interface KSUIDArgs
  extends Readonly<{
    ksuid: KSUID
  }> {}

export interface TimestampOutput
  extends Readonly<{
    createdAt: Date
    modifiedAt: Maybe<Date>
  }> {}

export enum ScalarType {
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  HOUR = 'HOUR',
  KSUID = 'KSUID',
  SLUG = 'SLUG',
  MONEY = 'MONEY',
  BUSINESS_ID = 'BUSINESS_ID',
  PERSONAL_IDENTITY_CODE = 'PERSONAL_IDENTITY_CODE',
  LANGUAGE = 'LANGUAGE',
  POSTAL_CODE = 'POSTAL_CODE',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  MUNICIPALITY = 'MUNICIPALITY',
  COUNTRY_CODE = 'COUNTRY_CODE',
  IBAN = 'IBAN',
  BIC = 'BIC',
  UI_LANGUAGE = 'UI_LANGUAGE'
}

export interface ScalarDate
  extends Readonly<{
    type: ScalarType.DATE
    value: string
  }> {}

export interface ScalarDateTime
  extends Readonly<{
    type: ScalarType.DATETIME
    value: string
  }> {}

export interface ScalarHour
  extends Readonly<{
    type: ScalarType.HOUR
    value: number
  }> {}

export interface ScalarKsuid
  extends Readonly<{
    type: ScalarType.KSUID
    value: string
  }> {}

export interface ScalarSlug
  extends Readonly<{
    type: ScalarType.SLUG
    value: string
  }> {}

export interface ScalarMoney
  extends Readonly<{
    type: ScalarType.MONEY
    value: number
  }> {}

export interface ScalarBusinessID
  extends Readonly<{
    type: ScalarType.BUSINESS_ID
    value: string
  }> {}

export interface ScalarPersonalIdentityCode
  extends Readonly<{
    type: ScalarType.PERSONAL_IDENTITY_CODE
    value: string
  }> {}

export interface ScalarLanguage
  extends Readonly<{
    type: ScalarType.LANGUAGE
    value: string
  }> {}

export interface ScalarPostalCode
  extends Readonly<{
    type: ScalarType.POSTAL_CODE
    value: string
  }> {}

export interface ScalarPhone
  extends Readonly<{
    type: ScalarType.PHONE
    value: string
  }> {}

export interface ScalarEmail
  extends Readonly<{
    type: ScalarType.EMAIL
    value: string
  }> {}

export interface ScalarMunicipality
  extends Readonly<{
    type: ScalarType.MUNICIPALITY
    value: string
  }> {}

export interface ScalarCountryCode
  extends Readonly<{
    type: ScalarType.COUNTRY_CODE
    value: string
  }> {}

export interface ScalarIBAN
  extends Readonly<{
    type: ScalarType.IBAN
    value: string
  }> {}

export interface ScalarBIC
  extends Readonly<{
    type: ScalarType.BIC
    value: string
  }> {}

export interface ScalarUILanguage
  extends Readonly<{
    type: ScalarType.UI_LANGUAGE
    value: string
  }> {}
