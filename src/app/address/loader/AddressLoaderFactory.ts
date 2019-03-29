import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { getAddressRecords } from '@app/address/addressRepository'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { AddressLoader } from './types'

export class AddressLoaderFactory extends AbstractLoaderFactory<AddressLoader> {
  protected createLoaders(client: PoolClient): AddressLoader {
    return new DataLoader(async ids => {
      const addresses = await getAddressRecords(client, ids)

      return ids.map(id => addresses.find(address => address.id === id) || null)
    })
  }
}
