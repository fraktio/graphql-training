import { GraphQLError, GraphQLScalarType, ValueNode } from 'graphql'

import { BIC, IBAN, Money } from '@app/finance/types'
import { validateBic, validateIban, validateMoney } from '@app/validation'
import { ScalarBIC, ScalarIBAN, ScalarMoney, ScalarType } from './types'
import { parseIntScalarLiteral, parseScalarValue, parseStringScalarLiteral } from './util'

export const financeResolvers = {
  Money: new GraphQLScalarType({
    description: 'Money custom scalar type',
    name: 'Money',

    serialize(value: Money): ScalarMoney {
      return {
        type: ScalarType.MONEY,
        value: value.getAmount()
      }
    },

    parseValue(value: any): Money {
      const scalarValue = parseScalarValue<number>(value, ScalarType.MONEY)

      const result = validateMoney(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Money must be an integer amount of euro cents')
      }
    },

    parseLiteral(ast: ValueNode): Money {
      const scalarValue = parseIntScalarLiteral(ast, ScalarType.MONEY)

      const result = validateMoney(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Money must be an integer amount of euro cents')
      }
    }
  }),

  IBAN: new GraphQLScalarType({
    description: 'IBAN custom scalar type',
    name: 'IBAN',

    serialize(value: IBAN): ScalarIBAN {
      return {
        type: ScalarType.IBAN,
        value: value.toString()
      }
    },

    parseValue(value: any): IBAN {
      const scalarValue = parseScalarValue<string>(value, ScalarType.IBAN)

      const result = validateIban(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('IBAN must be a valid IBAN')
      }
    },

    parseLiteral(ast: ValueNode): IBAN {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.IBAN)

      const result = validateIban(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('IBAN must be a valid IBAN')
      }
    }
  }),

  BIC: new GraphQLScalarType({
    description: 'BIC custom scalar type',
    name: 'BIC',

    serialize(value: BIC): ScalarBIC {
      return {
        type: ScalarType.BIC,
        value: value.toString()
      }
    },

    parseValue(value: any): BIC {
      const scalarValue = parseScalarValue<string>(value, ScalarType.BIC)

      const result = validateBic(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('BIC must be a valid BIC')
      }
    },

    parseLiteral(ast: ValueNode): BIC {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.BIC)

      const result = validateBic(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('BIC must be a valid BIC')
      }
    }
  })
}
