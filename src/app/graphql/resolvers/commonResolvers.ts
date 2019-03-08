import { GraphQLError, GraphQLScalarType, ValueNode } from 'graphql'
import KSUID from 'ksuid'

import { KsuidOutput, ScalarType } from './types'
import { parseScalarLiteral, parseScalarValue } from './util'

export interface Node {
  __typename: string
}

export const commonResolvers = {
  KSUID: new GraphQLScalarType({
    description: 'KSUID custom scalar type',
    name: 'KSUID',

    serialize(value: KSUID): KsuidOutput {
      return {
        type: ScalarType.KSUID,
        value: value.string
      }
    },

    parseValue(value: any): KSUID {
      const scalarValue = parseScalarValue<string>(value, ScalarType.KSUID)

      try {
        return KSUID.parse(scalarValue)
      } catch (e) {
        throw new GraphQLError('KSUID needs a field named "value" with a valid KSUID')
      }
    },

    parseLiteral(ast: ValueNode): KSUID {
      const scalarValue = parseScalarLiteral(ast, ScalarType.KSUID)

      try {
        return KSUID.parse(scalarValue)
      } catch (e) {
        throw new GraphQLError('KSUID needs a field named "value" with a valid KSUID')
      }
    }
  }),

  Node: {
    __resolveType(node: Node): string {
      return node.__typename
    }
  }
}
