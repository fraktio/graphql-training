import { Maybe } from '@app/common/types'

export type Hour = number

export interface Timestamp {
  createdAt: Date
  modifiedAt: Maybe<Date>
}
