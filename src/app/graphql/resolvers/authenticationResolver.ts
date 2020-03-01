import { AuthenticatedUserRecord, LoginInput } from '@app/authentication/types'
import { login, logout, refreshToken } from '@app/authentication/authenticationService'

import { Context } from '@app/graphql/types'
import { Maybe } from '@app/common/types'
import { Root } from './types'
import { decryptToken } from '../../../util/crypto'
import { transaction } from '@app/util/database'
import { withAuthenticatedUser } from '@app/graphql/resolvers/util/withAuthenticatedUser'

type LoginArgs = {
  input: LoginInput
}

type LoginOutput = LoginSuccess | LoginFailed

type LoginSuccess = {
  success: true
  authenticatedUser: AuthenticatedUserRecord
}

type LoginFailed = {
  success: false
}

type LogoutOutput = {
  token: string
}

type RefreshTokenOutput = {
  token: Maybe<string>
}

const authenticationResolvers = {
  Query: {
    currentUser(_: Root, args: {}, context: Context): AuthenticatedUserRecord {
      return withAuthenticatedUser(context, authenticatedUser => authenticatedUser)
    }
  },

  Mutation: {
    login(_: Root, { input }: LoginArgs, context: Context): Promise<LoginOutput> {
      return transaction(async client => {
        const authenticatedUser = await login(
          client,
          input,
          context.config.authentication.session.expirationTime
        )

        if (authenticatedUser) {
          return { success: true, authenticatedUser }
        }

        return {
          success: false
        }
      })
    },

    logout(_: Root, args: {}, context: Context): Promise<LogoutOutput> {
      return withAuthenticatedUser(context, authenticatedUser =>
        transaction(async client => {
          const token = await logout(client, authenticatedUser.encryptedToken)

          return {
            token
          }
        })
      )
    },

    refreshToken(_: Root, args: {}, context: Context): Promise<RefreshTokenOutput> {
      return transaction(async client => {
        let token = null

        if (context.encryptedAuthenticationToken != null) {
          const authenticationToken = await refreshToken(
            client,
            context.encryptedAuthenticationToken,
            context.config.authentication.session.expirationTime
          )

          if (authenticationToken) {
            token = decryptToken(authenticationToken.encryptedToken)
          }
        }

        return {
          token
        }
      })
    }
  },

  AuthenticatedUser: {
    token(authenticatedUser: AuthenticatedUserRecord, args: {}): string {
      return decryptToken(authenticatedUser.encryptedToken)
    }
  }
}

export default resolvers
