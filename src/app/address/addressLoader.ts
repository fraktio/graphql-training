import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { getAddressRecords } from '@app/address/addressRepository'
import { AddressRecord } from '@app/address/types'
import { ID, Maybe } from '@app/common/types'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'

export type AddressLoader = DataLoader<ID, Maybe<AddressRecord>>

export class AddressLoaderFactory extends AbstractLoaderFactory<AddressLoader> {
  protected createLoader(client: PoolClient): AddressLoader {
    return new DataLoader(async ids => {
      const addresses = await getAddressRecords(client, ids)

      return ids.map(id => addresses.find(address => address.id === id) || null)
    })
  }
}
