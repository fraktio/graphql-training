import { UserRecord } from '@app/user/types'
import { UserLoader } from '@app/user/userLoader'

export async function tryGetUser(loader: UserLoader, id: number): Promise<UserRecord> {
  const user = await loader.load(id)

  if (!user) {
    throw new Error(`User was expected to be found with id ${id}`)
  }

  return user
}
