import { ApolloError } from 'apollo-server-express'
import { AuthenticatedUserRecord } from '@app/authentication/types'
import { Config } from '@src/config'
import { LoaderFactories } from '@app/loader'
import { Maybe } from '@app/common/types'
import { readConfigByApplication } from '@src/config'

export interface Context
  extends Readonly<{
    loaderFactories: LoaderFactories
    currentUser: Maybe<AuthenticatedUserRecord>
    config: Config
    encryptedAuthenticationToken: Maybe<string>
  }> {}

export class NotFoundError extends ApolloError {
  constructor(message: string) {
    super(message, 'NOT_FOUND')

    Object.defineProperty(this, 'name', { value: 'NotFoundError' })
  }
}
