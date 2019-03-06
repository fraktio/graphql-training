import KSUID from 'ksuid'

export type Root = typeof undefined

export interface IdArgs {
  ksuid: KSUID
}

export interface TimestampOutput {
  createdAt: Date
  modifiedAt: Date | null
}
