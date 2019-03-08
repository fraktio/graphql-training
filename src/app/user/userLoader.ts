import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { ID, Maybe } from '@app/common/types'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { UserRecord } from '@app/user/types'
import { getUserRecords } from '@app/user/userRepository'

export type UserLoader = DataLoader<ID, Maybe<UserRecord>>

export class UserLoaderFactory extends AbstractLoaderFactory<UserLoader> {
  protected createLoader(client: PoolClient): UserLoader {
    return new DataLoader(async ids => {
      const users = await getUserRecords(client, ids)

      return ids.map(id => users.find(user => user.id === id) || null)
    })
  }
}
