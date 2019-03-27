import { Email } from '@app/address/types'
import { ID } from '@app/common/types'

export enum UILanguage {
  FI = 'FI'
}

export interface UserRecord
  extends Readonly<{
    id: ID
    email: Email
  }> {}
