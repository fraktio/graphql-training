import { GraphQLError, GraphQLFieldResolver, GraphQLScalarType, ValueNode } from 'graphql'
import { ScalarKsuid, ScalarSlug, ScalarType } from './types'
import { ScalarValidationError, ScalarValidationErrorType } from './util/scalarValidationError'
import { parseScalarValue, parseStringScalarLiteral } from './util'

import KSUID from 'ksuid'
import { Slug } from '@app/common/types'
import { validateSlug } from '@app/validation'

export interface Node
  extends Readonly<{
    __typename: string
  }> {}

export const commonResolvers = {
  KSUID: new GraphQLScalarType({
    description: 'KSUID custom scalar type',
    name: 'KSUID',

    serialize(value: KSUID): ScalarKsuid {
      return {
        type: ScalarType.KSUID,
        value: value.string
      }
    },

    parseValue(value: any): KSUID | ScalarValidationError {
      const scalarValue = parseScalarValue<string>(value, ScalarType.KSUID)

      try {
        return KSUID.parse(scalarValue)
      } catch (e) {
        return {
          type: ScalarValidationErrorType.SCALAR_VALIDATION_ERROR,
          message: 'KSUID must be a valid KSUID'
        }
        //  throw new GraphQLError('KSUID must be a valid KSUID')
      }
    },

    parseLiteral(ast: ValueNode): KSUID {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.KSUID)

      try {
        return KSUID.parse(scalarValue)
      } catch (e) {
        throw new GraphQLError('KSUID must be a valid KSUID')
      }
    }
  }),

  Slug: new GraphQLScalarType({
    description: 'Slug custom scalar type',
    name: 'Slug',

    serialize(value: Slug): ScalarSlug {
      return {
        type: ScalarType.SLUG,
        value: value.toString()
      }
    },

    parseValue(value: any): Slug {
      const scalarValue = parseScalarValue<string>(value, ScalarType.SLUG)

      const result = validateSlug(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Slug must be a valid slug')
      }
    },

    parseLiteral(ast: ValueNode): Slug {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.SLUG)

      const result = validateSlug(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Slug must be a valid slug')
      }
    }
  }),

  Node: {
    __resolveType(node: Node): string {
      return node.__typename
    }
  }
}
