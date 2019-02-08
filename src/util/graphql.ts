import { GraphQLSchema } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { fileLoader, mergeTypes } from 'merge-graphql-schemas'
import path from 'path'

const schame = fileLoader(path.join(__dirname, '../app/graphql/types'))

import { resolvers } from '@app/graphql/resolvers'

const typeDefs = mergeTypes(schame, { all: true })

export function createSchema(): GraphQLSchema {
  return makeExecutableSchema({
    allowUndefinedInResolve: false,
    resolverValidationOptions: {
      requireResolversForArgs: true,
      requireResolversForResolveType: true
    },
    resolvers,
    typeDefs
  })
}
