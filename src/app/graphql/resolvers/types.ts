import KSUID from 'ksuid'

import { Maybe } from '@app/common/types'

export type Root = typeof undefined

export interface KSUIDArgs {
  ksuid: KSUID
}

export interface TimestampOutput {
  createdAt: Date
  modifiedAt: Maybe<Date>
}

export enum ScalarType {
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  KSUID = 'KSUID'
}

export interface KsuidOutput {
  type: ScalarType.KSUID
  value: string
}
