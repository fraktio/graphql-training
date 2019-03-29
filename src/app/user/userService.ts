import { ID } from '@app/common/types'
import { UserLoader } from '@app/user/loader/types'
import { UserRecord } from '@app/user/types'

export async function tryGetUser(loader: UserLoader, id: ID): Promise<UserRecord> {
  const user = await loader.load(id)

  if (!user) {
    throw new Error(`User was expected to be found with id ${id}`)
  }

  return user
}
