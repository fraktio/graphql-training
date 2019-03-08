export type Maybe<T> = T | null

// tslint:disable-next-line:interface-name
export interface ID extends Number {
  _id: never
}

export interface Slug extends String {
  _slug: never
}

export interface BusinessID extends String {
  _businessId: never
}
