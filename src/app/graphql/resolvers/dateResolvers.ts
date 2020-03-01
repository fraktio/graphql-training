import { GraphQLScalarType, ValueNode } from 'graphql'
import { ScalarDate, ScalarDateTime, ScalarHour, ScalarType } from './types'
import { format, isValid, parse } from 'date-fns'
import { parseIntScalarLiteral, parseScalarValue, parseStringScalarLiteral } from './util'

import { Hour } from '@app/date/types'
import { UserInputError } from 'apollo-server-express'
import { validateHour } from '@app/validation'

export const dateResolvers = {
  Date: new GraphQLScalarType({
    description: 'Date custom scalar type',
    name: 'Date',

    serialize(value: Date): ScalarDate {
      return {
        type: ScalarType.DATE,
        value: format(value, 'yyyy-MM-dd')
      }
    },

    parseValue(value: any): Date {
      const scalarValue = parseScalarValue<string>(value, ScalarType.DATE)

      if (!isValidDate(scalarValue)) {
        throw new UserInputError(`Date must be a valid date in format "YYYY-MM-DD"`)
      }

      return parse(scalarValue, 'yyyy-MM-dd', 0)
    },

    parseLiteral(ast: ValueNode): Date {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.DATE)

      if (!isValidDate(scalarValue)) {
        throw new UserInputError(`Date must be a valid date in format "YYYY-MM-DD"`)
      }

      return parse(scalarValue, 'yyyy-MM-dd', 0)
    }
  }),

  DateTime: new GraphQLScalarType({
    description: 'DateTime custom scalar type',
    name: 'DateTime',

    serialize(value: Date): ScalarDateTime {
      return {
        type: ScalarType.DATETIME,
        value: value.toISOString() //format(value, 'yyyy-MM-ddTHH:mm:ss.SSS X')
      }
    },

    parseValue(value: any): Date {
      const scalarValue = parseScalarValue<string>(value, ScalarType.DATETIME)

      if (!isValidDateTime(scalarValue)) {
        throw new UserInputError(
          `DateTime must be a valid date in format "YYYY-MM-DDTHH:mm:ss.SSSZ"`
        )
      }

      return parse(scalarValue, 'yyyy-MM-ddTHH:mm:ss.SSSZ', 0)
    },

    parseLiteral(ast: ValueNode): Date {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.DATETIME)

      if (!isValidDateTime(scalarValue)) {
        throw new UserInputError(
          `DateTime must be a valid date in format "YYYY-MM-DDTHH:mm:ss.SSSZ"`
        )
      }

      return parse(scalarValue, 'yyyy-MM-ddTHH:mm:ss.SSSZ', 0)
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
        throw new UserInputError('Hour must be a positive integer between 0 and 299')
      }
    },

    parseLiteral(ast: ValueNode): Hour {
      const scalarValue = parseIntScalarLiteral(ast, ScalarType.HOUR)

      const result = validateHour(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new UserInputError('Hour must be a positive integer between 0 and 299')
      }
    }
  })
}

function isValidDate(value: string): boolean {
  const date = parse(value, 'yyyy-MM-dd', 0)

  if (!isValid(date) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  return true
}

function isValidDateTime(value: string): boolean {
  const date = parse(value, 'yyyy-MM-ddTHH:mm:ss.SSSZ', 0)

  if (!isValid(date) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return false
  }

  return true
}
