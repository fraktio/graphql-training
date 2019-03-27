import { Maybe } from '@app/common/types'

export interface Hour extends Number {
  _hour: never
}

export interface Timestamp
  extends Readonly<{
    createdAt: Date
    modifiedAt: Maybe<Date>
  }> {}
