import { Email } from '@app/address/types'
import { ID } from '@app/common/types'

export interface UserRecord
  extends Readonly<{
    id: ID
    email: Email
  }> {}
