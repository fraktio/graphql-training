import { ApolloEngine } from 'apollo-engine'
import { ApolloServer } from 'apollo-server-express'

import { Config } from '@src/config'
import { createSchema } from '@src/util/graphql'

const schema = createSchema()

export function createApolloServer(config: Config): ApolloServer {
  return new ApolloServer({
    cacheControl: config.graphql.engineProxy,
    introspection: config.graphql.playground || config.graphql.engineProxy,
    playground: config.graphql.playground,
    schema,
    tracing: config.graphql.engineProxy,

    // By setting this to "false", we avoid using Apollo Server 2's
    // integrated metric reporting and fall-back to using the Apollo
    // Engine Proxy (running separately) for metric collection.
    engine: false
  })
}

export function createApolloEngine(apiKey: string): ApolloEngine {
  return new ApolloEngine({
    apiKey
  })
}
