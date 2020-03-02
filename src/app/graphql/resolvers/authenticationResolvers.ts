import {
  AddUserAccountInput,
  AuthenticatedUserRecord,
  LoginInput,
  UserRecord
} from '@app/authentication/types'
import { ValidationErrorCode, ValidationErrors } from '@app/graphql/schema/types'
import { login, logout, refreshToken } from '@app/authentication/authenticationService'

import { Context } from '@app/graphql/types'
import { Maybe } from '@app/common/types'
import { Root } from './types'
import { addUserAccount } from '@app/authentication/authenticationRepository'
import { decryptToken } from '../../../util/crypto'
import { transaction } from '@app/util/database'
import { withAuthenticatedUser } from '@app/graphql/resolvers/util/withAuthenticatedUser'

interface LoginArgs {
  input: LoginInput
}

type LoginOutput = LoginSuccess | LoginFailed

interface LoginSuccess {
  success: true
  authenticatedUser: AuthenticatedUserRecord
}

interface LoginFailed {
  success: false
}

type LogoutOutput = {
  token: string
}

interface RefreshTokenOutput {
  token: Maybe<string>
}

interface AddUserArgs {
  input: AddUserAccountInput
}

export type AddUserAccountOutput = AddUserAccountSuccess | ValidationErrors

interface AddUserAccountSuccess
  extends Readonly<{
    user: UserRecord
    success: true
  }> {}

export const authenticationResolvers = {
  Query: {
    currentUser(_: Root, args: {}, context: Context): AuthenticatedUserRecord {
      return withAuthenticatedUser(context, authenticatedUser => authenticatedUser)
    }
  },

  Mutation: {
    login(_: Root, { input }: LoginArgs, context: Context): Promise<LoginOutput> {
      return transaction(async connection => {
        const authenticatedUser = await login(
          connection,
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
        transaction(async connection => {
          const token = await logout(connection, authenticatedUser.encryptedToken)

          return {
            token
          }
        })
      )
    },

    refreshToken(_: Root, args: {}, context: Context): Promise<RefreshTokenOutput> {
      return transaction(async connection => {
        let token = null

        if (context.encryptedAuthenticationToken != null) {
          const authenticationToken = await refreshToken(
            connection,
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
    },

    addUserAccount(
      _: Root,
      { input }: AddUserArgs,
      context: Context
    ): Promise<AddUserAccountOutput> {
      return transaction(async connection => {
        const result = await addUserAccount(connection, input)

        if (result.success) {
          return {
            success: true as true,
            user: result.value
          }
        }

        return {
          success: false as false,
          validationErrors: [
            {
              code: ValidationErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
              message: result.error.field
            }
          ]
        }
      })
    }
  },

  AuthenticatedUser: {
    token(authenticatedUser: AuthenticatedUserRecord, args: {}): string {
      return decryptToken(authenticatedUser.encryptedToken)
    }
  },
  AddUserAccountOutput: {
    __resolveType(addUserAccountOutput: AddUserAccountOutput): string {
      return addUserAccountOutput.success ? 'AddUserAccountOutputSuccess' : 'ValidationErrors'
    }
  }
}
