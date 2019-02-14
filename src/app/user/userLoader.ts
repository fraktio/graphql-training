import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { UserRecord } from '@app/user/types'
import { getUsers } from '@app/user/userRepository'

export type UserLoader = DataLoader<number, UserRecord | null>

export class UserLoaderFactory extends AbstractLoaderFactory<UserLoader> {
  protected createLoader(client: PoolClient): UserLoader {
    return new DataLoader(async ids => {
      const users = await getUsers(client, ids)

      return ids.map(id => users.find(user => user.id === id) || null)
    })
  }
}
