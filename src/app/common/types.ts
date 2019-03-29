export type Maybe<T> = T | null

export type Try<T, E extends Error> = Success<T> | Failure<E>

export interface Success<T>
  extends Readonly<{
    value: T
    success: true
  }> {}

export interface Failure<E>
  extends Readonly<{
    error: E
    success: false
  }> {}

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
