export type PostalCode = string

export type Municipality = string

export type Phone = string

export type Email = string

export interface AddressRecord
  extends Readonly<{
    id: number
    streetAddress: string
    postalCode: PostalCode
    municipality: Municipality
    country: string | null
  }> {}

export interface AddressInput
  extends Readonly<{
    streetAddress: string
    postalCode: PostalCode
    municipality: string
    country: string | null
  }> {}
