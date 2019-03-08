import { ApolloError } from 'apollo-server-express'

import { LoaderFactories } from '@app/loader'

export interface Context {
  loaderFactories: LoaderFactories
}

export class NotFoundError extends ApolloError {
  constructor(message: string) {
    super(message, 'NOT_FOUND')

    Object.defineProperty(this, 'name', { value: 'NotFoundError' })
  }
}
