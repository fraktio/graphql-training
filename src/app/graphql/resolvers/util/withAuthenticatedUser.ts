import { AuthenticatedUserRecord } from '@app/authentication/types'
import { AuthenticationError } from 'apollo-server-express'
import { Context } from '@app/graphql/types'

export function withAuthenticatedUser<T>(
  context: Context,
  callback: (user: AuthenticatedUserRecord) => T
): T {
  if (!context.currentUser) {
    throw new AuthenticationError('Authentication required')
  }

  return callback(context.currentUser)
}
