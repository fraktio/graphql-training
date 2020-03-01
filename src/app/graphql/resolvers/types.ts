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
  SLUG = 'SLUG',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  HOUR = 'HOUR',
  KSUID = 'KSUID',
  PERSONAL_IDENTITY_CODE = 'PERSONAL_IDENTITY_CODE',
  COUNTRY_CODE = 'COUNTRY_CODE',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL'
}

export interface ScalarSlug
  extends Readonly<{
    type: ScalarType.SLUG
    value: string
  }> {}

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

export interface ScalarPersonalIdentityCode
  extends Readonly<{
    type: ScalarType.PERSONAL_IDENTITY_CODE
    value: string
  }> {}

export interface ScalarCountryCode
  extends Readonly<{
    type: ScalarType.COUNTRY_CODE
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
