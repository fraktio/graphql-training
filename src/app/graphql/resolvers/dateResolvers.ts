import { format, isValid, parse } from 'date-fns'
import { GraphQLError, GraphQLScalarType, ValueNode } from 'graphql'

import { Hour } from '@app/date/types'
import { validateHour } from '@app/validation'
import { ScalarDate, ScalarDateTime, ScalarHour, ScalarType } from './types'
import { parseIntScalarLiteral, parseScalarValue, parseStringScalarLiteral } from './util'

export const dateResolvers = {
  Date: new GraphQLScalarType({
    description: 'Date custom scalar type',
    name: 'Date',

    serialize(value: Date): ScalarDate {
      return {
        type: ScalarType.DATE,
        value: format(value, 'YYYY-MM-DD')
      }
    },

    parseValue(value: any): Date {
      const scalarValue = parseScalarValue<string>(value, ScalarType.DATE)

      if (!isValidDate(scalarValue)) {
        throw new GraphQLError(`Date must be a valid date in format "YYYY-MM-DD"`)
      }

      return parse(scalarValue)
    },

    parseLiteral(ast: ValueNode): Date {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.DATE)

      if (!isValidDate(scalarValue)) {
        throw new GraphQLError(`Date must be a valid date in format "YYYY-MM-DD"`)
      }

      return parse(scalarValue)
    }
  }),

  DateTime: new GraphQLScalarType({
    description: 'DateTime custom scalar type',
    name: 'DateTime',

    serialize(value: Date): ScalarDateTime {
      return {
        type: ScalarType.DATETIME,
        value: format(value)
      }
    },

    parseValue(value: any): Date {
      const scalarValue = parseScalarValue<string>(value, ScalarType.DATETIME)

      if (!isValidDateTime(scalarValue)) {
        throw new GraphQLError(`DateTime must be a valid date in format "YYYY-MM-DDTHH:mm:ss.SSSZ"`)
      }

      return parse(scalarValue)
    },

    parseLiteral(ast: ValueNode): Date {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.DATETIME)

      if (!isValidDateTime(scalarValue)) {
        throw new GraphQLError(`DateTime must be a valid date in format "YYYY-MM-DDTHH:mm:ss.SSSZ"`)
      }

      return parse(scalarValue)
    }
  }),

  Hour: new GraphQLScalarType({
    description: 'Hour custom scalar type',
    name: 'Hour',

    serialize(value: Hour): ScalarHour {
      return {
        type: ScalarType.HOUR,
        value: parseInt(value.toString(), 10)
      }
    },

    parseValue(value: any): Hour {
      const scalarValue = parseScalarValue<number>(value, ScalarType.HOUR)

      const result = validateHour(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Hour must be a positive integer between 0 and 299')
      }
    },

    parseLiteral(ast: ValueNode): Hour {
      const scalarValue = parseIntScalarLiteral(ast, ScalarType.HOUR)

      const result = validateHour(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Hour must be a positive integer between 0 and 299')
      }
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
