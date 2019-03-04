import { GraphQLError, GraphQLScalarType, Kind, ValueNode } from 'graphql'
import KSUID from 'ksuid'

export interface Node {
  __typename: string
}

export const commonResolvers = {
  KSUID: new GraphQLScalarType({
    description: 'KSUID custom scalar type',
    name: 'KSUID',

    serialize(value: KSUID): string {
      return value.string
    },

    parseValue(value: any): KSUID {
      return KSUID.parse(value)
    },

    parseLiteral(ast: ValueNode): KSUID {
      if (ast.kind !== Kind.STRING) {
        throw new GraphQLError(`KSUID type should be String, found ${ast.kind}.`)
      }

      return KSUID.parse(ast.value)
    }
  }),

  Node: {
    __resolveType(node: Node): string {
      return node.__typename
    }
  }
}
