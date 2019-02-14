import { AddressLoader } from '@app/address/addressLoader'
import { AddressRecord } from '@app/address/types'

export async function tryGetAddress(loader: AddressLoader, id: number): Promise<AddressRecord> {
  const address = await loader.load(id)

  if (!address) {
    throw new Error(`Address was expected to be found with id ${id}`)
  }

  return address
}
