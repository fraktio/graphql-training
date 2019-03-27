import Dinero, { Dinero as DineroType } from 'dinero.js'

export const Money = Dinero
export type Money = DineroType

// tslint:disable-next-line:interface-name
export interface IBAN extends String {
  _iban: never
}

export interface BIC extends String {
  _bic: never
}
