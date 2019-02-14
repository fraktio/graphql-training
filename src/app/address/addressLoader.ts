import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { getAddresses } from '@app/address/addressRepository'
import { AddressRecord } from '@app/address/types'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'

export type AddressLoader = DataLoader<number, AddressRecord | null>

export class AddressLoaderFactory extends AbstractLoaderFactory<AddressLoader> {
  protected createLoader(client: PoolClient): AddressLoader {
    return new DataLoader(async ids => {
      const addresses = await getAddresses(client, ids)

      return ids.map(id => addresses.find(address => address.id === id) || null)
    })
  }
}
