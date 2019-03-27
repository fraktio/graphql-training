import { GraphQLError, GraphQLScalarType, ValueNode } from 'graphql'

import { UILanguage } from '@app/user/types'
import { validateUiLanguage } from '@app/validation'
import { ScalarType, ScalarUILanguage } from './types'
import { parseScalarValue, parseStringScalarLiteral } from './util'

export const userResolvers = {
  UILanguage: new GraphQLScalarType({
    description: 'UILanguage custom scalar type',
    name: 'UILanguage',

    serialize(value: UILanguage): ScalarUILanguage {
      return {
        type: ScalarType.UI_LANGUAGE,
        value: value.toString()
      }
    },

    parseValue(value: any): UILanguage {
      const scalarValue = parseScalarValue<string>(value, ScalarType.UI_LANGUAGE)

      const result = validateUiLanguage(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('UILanguage must be a valid UI language')
      }
    },

    parseLiteral(ast: ValueNode): UILanguage {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.UI_LANGUAGE)

      const result = validateUiLanguage(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('UILanguage must be a valid UI language')
      }
    }
  })
}
