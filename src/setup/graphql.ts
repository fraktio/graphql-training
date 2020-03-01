import { ApolloEngine } from 'apollo-engine'
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
    cacheControl: config.graphql.engineProxy,
    introspection: config.graphql.playground || config.graphql.engineProxy,
    playground: config.graphql.playground,
    schema,
    tracing: config.graphql.engineProxy,

    // By setting this to "false", we avoid using Apollo Server 2's
    // integrated metric reporting and fall-back to using the Apollo
    // Engine Proxy (running separately) for metric collection.
    engine: false,

    formatError: error => {
      // tslint:disable-next-line:no-console
      console.error(error)

      return error
    },

    context: async ({ req, res }): Promise<Context> => {
      return transaction(async client => {
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

export function createApolloEngine(apiKey: string): ApolloEngine {
  return new ApolloEngine({
    apiKey
  })
}
