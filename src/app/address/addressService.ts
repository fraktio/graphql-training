import { AddressLoader } from '@app/address/loader/types'
import { AddressRecord } from '@app/address/types'
import { ID } from '@app/common/types'

export async function tryGetAddress(loader: AddressLoader, id: ID): Promise<AddressRecord> {
  const address = await loader.load(id)

  if (!address) {
    throw new Error(`Address was expected to be found with id ${id}`)
  }

  return address
}
