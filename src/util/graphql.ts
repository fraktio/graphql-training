import { fileLoader, mergeTypes } from 'merge-graphql-schemas'

import { GraphQLSchema } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import path from 'path'
import { resolvers } from '@app/graphql/resolvers'
import { schemaDirectives } from '@app/graphql/directives'

const schema = fileLoader(path.join(__dirname, '../app/graphql/schema/*.graphql'))

const typeDefs = mergeTypes(schema, { all: true })

export function createSchema(): GraphQLSchema {
  return makeExecutableSchema({
    allowUndefinedInResolve: false,
    resolverValidationOptions: {
      requireResolversForArgs: true,
      requireResolversForResolveType: true
    },
    resolvers,
    typeDefs,
    schemaDirectives
  })
}
