import DataLoader from 'dataloader'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getUserRecords } from '@app/user/userRepository'
import { PoolConnection } from '@app/util/database/types'
import { UserLoader } from './types'

export class UserLoaderFactory extends AbstractLoaderFactory<UserLoader> {
  protected createLoaders(connection: PoolConnection): UserLoader {
    return new DataLoader(async ids => {
      const users = await getUserRecords(connection, ids)

      return ids.map(id => users.find(user => user.id === id) || null)
    })
  }
}
