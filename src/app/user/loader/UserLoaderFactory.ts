import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getUserRecords } from '@app/user/userRepository'
import { UserLoader } from './types'

export class UserLoaderFactory extends AbstractLoaderFactory<UserLoader> {
  protected createLoaders(client: PoolClient): UserLoader {
    return new DataLoader(async ids => {
      const users = await getUserRecords(client, ids)

      return ids.map(id => users.find(user => user.id === id) || null)
    })
  }
}
