import DataLoader from 'dataloader'

import { getAddressRecords } from '@app/address/addressRepository'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { PoolConnection } from '@app/util/database/types'
import { AddressLoader } from './types'

export class AddressLoaderFactory extends AbstractLoaderFactory<AddressLoader> {
  protected createLoaders(connection: PoolConnection): AddressLoader {
    return new DataLoader(async ids => {
      const addresses = await getAddressRecords(connection, ids)

      return ids.map(id => addresses.find(address => address.id === id) || null)
    })
  }
}
