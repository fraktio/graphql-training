import { AddressLoaderFactory } from '@app/address/addressLoader'
import { PersonLoaderFactory } from '@app/person/personLoader'
import { UserLoaderFactory } from '@app/user/userLoader'

export interface LoaderFactories {
  addressLoaderFactory: AddressLoaderFactory
  personLoaderFactory: PersonLoaderFactory
  userLoaderFactory: UserLoaderFactory
}

export function createLoaderFactories(): LoaderFactories {
  return {
    addressLoaderFactory: new AddressLoaderFactory(),
    personLoaderFactory: new PersonLoaderFactory(),
    userLoaderFactory: new UserLoaderFactory()
  }
}
