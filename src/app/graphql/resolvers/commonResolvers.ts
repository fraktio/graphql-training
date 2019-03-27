import { GraphQLError, GraphQLScalarType, ValueNode } from 'graphql'
import KSUID from 'ksuid'

import { BusinessID, Slug } from '@app/common/types'
import { validateBusinessId, validateSlug } from '@app/validation'
import { ScalarBusinessID, ScalarKsuid, ScalarSlug, ScalarType } from './types'
import { parseScalarValue, parseStringScalarLiteral } from './util'

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

    parseValue(value: any): KSUID {
      const scalarValue = parseScalarValue<string>(value, ScalarType.KSUID)

      try {
        return KSUID.parse(scalarValue)
      } catch (e) {
        throw new GraphQLError('KSUID must be a valid KSUID')
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

  BusinessID: new GraphQLScalarType({
    description: 'BusinessID custom scalar type',
    name: 'BusinessID',

    serialize(value: BusinessID): ScalarBusinessID {
      return {
        type: ScalarType.BUSINESS_ID,
        value: value.toString()
      }
    },

    parseValue(value: any): BusinessID {
      const scalarValue = parseScalarValue<string>(value, ScalarType.BUSINESS_ID)

      const result = validateBusinessId(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('BusinessID must be a valid business id')
      }
    },

    parseLiteral(ast: ValueNode): BusinessID {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.BUSINESS_ID)

      const result = validateBusinessId(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('BusinessID must be a valid business id')
      }
    }
  }),

  Node: {
    __resolveType(node: Node): string {
      return node.__typename
    }
  }
}
