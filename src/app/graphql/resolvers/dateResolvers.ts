import { format, isValid, parse } from 'date-fns'
import { GraphQLError, GraphQLScalarType, ValueNode } from 'graphql'

import { ScalarType } from './types'
import { parseScalarLiteral, parseScalarValue } from './util'

interface DateOutput {
  type: ScalarType.DATE
  value: string
}

interface DateTimeOutput {
  type: ScalarType.DATETIME
  value: string
}

export const dateResolvers = {
  Date: new GraphQLScalarType({
    description: 'Date custom scalar type',
    name: 'Date',

    serialize(value: Date): DateOutput {
      return {
        type: ScalarType.DATE,
        value: format(value, 'YYYY-MM-DD')
      }
    },

    parseValue(value: any): Date {
      const scalarValue = parseScalarValue<string>(value, ScalarType.DATE)

      if (!isValidDate(scalarValue)) {
        throw new GraphQLError(
          `Date needs a field named "value" with a value in format "YYYY-MM-DD"`
        )
      }

      return parse(scalarValue)
    },

    parseLiteral(ast: ValueNode): Date {
      const scalarValue = parseScalarLiteral(ast, ScalarType.DATE)

      if (!isValidDate(scalarValue)) {
        throw new GraphQLError(
          `Date needs a field named "value" with a value in format "YYYY-MM-DD"`
        )
      }

      return parse(scalarValue)
    }
  }),

  DateTime: new GraphQLScalarType({
    description: 'DateTime custom scalar type',
    name: 'DateTime',

    serialize(value: Date): DateTimeOutput {
      return {
        type: ScalarType.DATETIME,
        value: format(value)
      }
    },

    parseValue(value: any): Date {
      const scalarValue = parseScalarValue<string>(value, ScalarType.DATETIME)

      if (!isValidDateTime(scalarValue)) {
        throw new GraphQLError(
          `DateTime needs a field named "value" with a value in format "YYYY-MM-DDTHH:mm:ss.SSSZ"`
        )
      }

      return parse(scalarValue)
    },

    parseLiteral(ast: ValueNode): Date {
      const scalarValue = parseScalarLiteral(ast, ScalarType.DATETIME)

      if (!isValidDateTime(scalarValue)) {
        throw new GraphQLError(
          `Date needs a field named "value" with a value in format "YYYY-MM-DDTHH:mm:ss.SSSZ"`
        )
      }

      return parse(scalarValue)
    }
  })
}

function isValidDate(value: string): boolean {
  const date = parse(value)

  if (!isValid(date) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  return true
}

function isValidDateTime(value: string): boolean {
  const date = parse(value)

  if (!isValid(date) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return false
  }

  return true
}
