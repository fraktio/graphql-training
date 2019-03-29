import { ID } from '@app/common/types'

export type PostalCode = string

export type Municipality = string

export type Country = string

export type Phone = string

export interface Email extends String {
  _email: never
}

export interface AddressRecord
  extends Readonly<{
    id: ID
    streetAddress: string
    postalCode: PostalCode
    municipality: Municipality
    country: Country
  }> {}

export interface AddressInput
  extends Readonly<{
    streetAddress: string
    postalCode: PostalCode
    municipality: string
    country: Country
  }> {}
