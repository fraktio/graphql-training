import { execute, subscribe } from 'graphql'

import { ApolloServer } from 'apollo-server-express'
import { Config } from '@src/config'
import { Context } from '@app/graphql/types'
import { createLoaderFactories } from '@app/loader'
import { createSchema } from '@src/util/graphql'
import { getAuthenticatedUserAndEncryptedAuthenticationToken } from '@app/authentication/authenticationService'
import { transaction } from '@app/util/database'

const schema = createSchema()

export function createApolloServer(config: Config): ApolloServer {
  const { expirationTime, refreshTime } = config.authentication.session

  return new ApolloServer({
    introspection: config.graphql.playground,
    playground: config.graphql.playground,
    schema,

    // By setting this to "false", we avoid using Apollo Server 2's
    // integrated metric reporting and fall-back to using the Apollo
    // Engine Proxy (running separately) for metric collection.
    engine: getEngine(config.graphql.engine),

    formatError: error => {
      // tslint:disable-next-line:no-console
      console.error(error)

      return error
    },

    context: async ({ req, res, connection }): Promise<Context> => {
      return transaction(async client => {
        if (connection) {
          // for subscription

          let token = connection.context['x-access-token']
          console.log('TOKEN ', connection.authorization)
          return connection.context
        }

        const {
          currentUser,
          encryptedAuthenticationToken
        } = await getAuthenticatedUserAndEncryptedAuthenticationToken(
          client,
          req.headers.authorization ? req.headers.authorization : '',
          expirationTime,
          refreshTime
        )

        return {
          config,
          currentUser,
          encryptedAuthenticationToken,
          loaderFactories: createLoaderFactories()
        }
      })
    }
  })
}

function getEngine(engine: boolean) {
  if (!engine) {
    return false
  }

  const engineApiKey = process.env.ENGINE_API_KEY
  if (engineApiKey == null) {
    throw new Error('process.env.ENGINE_API_KEY is not defined!')
  }
  return {
    apiKey: process.env.ENGINE_API_KEY,
    schemaTag: 'development'
  }
}
