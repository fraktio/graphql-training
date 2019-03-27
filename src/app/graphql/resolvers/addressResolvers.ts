import { GraphQLError, GraphQLScalarType, ValueNode } from 'graphql'

import { CountryCode, Email, Municipality, Phone, PostalCode } from '@app/address/types'
import {
  validateCountryCode,
  validateEmail,
  validateMunicipality,
  validatePhone,
  validatePostalCode
} from '@app/validation'
import {
  ScalarCountryCode,
  ScalarEmail,
  ScalarMunicipality,
  ScalarPhone,
  ScalarPostalCode,
  ScalarType
} from './types'
import { parseScalarValue, parseStringScalarLiteral } from './util'

export const addressResolvers = {
  PostalCode: new GraphQLScalarType({
    description: 'PostalCode custom scalar type',
    name: 'PostalCode',

    serialize(value: PostalCode): ScalarPostalCode {
      return {
        type: ScalarType.POSTAL_CODE,
        value: value.toString()
      }
    },

    parseValue(value: any): PostalCode {
      const scalarValue = parseScalarValue<string>(value, ScalarType.POSTAL_CODE)

      const result = validatePostalCode(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('PostalCode must be a valid postal code')
      }
    },

    parseLiteral(ast: ValueNode): PostalCode {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.POSTAL_CODE)

      const result = validatePostalCode(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('PostalCode must be a valid postal code')
      }
    }
  }),

  Phone: new GraphQLScalarType({
    description: 'Phone custom scalar type',
    name: 'Phone',

    serialize(value: Phone): ScalarPhone {
      return {
        type: ScalarType.PHONE,
        value: value.toString()
      }
    },

    parseValue(value: any): Phone {
      const scalarValue = parseScalarValue<string>(value, ScalarType.PHONE)

      const result = validatePhone(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Phone must be a valid a valid phone number')
      }
    },

    parseLiteral(ast: ValueNode): Phone {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.PHONE)

      const result = validatePhone(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Phone must be a valid a valid phone number')
      }
    }
  }),

  Email: new GraphQLScalarType({
    description: 'Email custom scalar type',
    name: 'Email',

    serialize(value: Email): ScalarEmail {
      return {
        type: ScalarType.EMAIL,
        value: value.toString()
      }
    },

    parseValue(value: any): Email {
      const scalarValue = parseScalarValue<string>(value, ScalarType.EMAIL)

      const result = validateEmail(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Email must be a valid a valid emai address')
      }
    },

    parseLiteral(ast: ValueNode): Email {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.EMAIL)

      const result = validateEmail(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Email must be a valid a valid emai address')
      }
    }
  }),

  Municipality: new GraphQLScalarType({
    description: 'Municipality custom scalar type',
    name: 'Municipality',

    serialize(value: Municipality): ScalarMunicipality {
      return {
        type: ScalarType.MUNICIPALITY,
        value: value.toString()
      }
    },

    parseValue(value: any): Municipality {
      const scalarValue = parseScalarValue<string>(value, ScalarType.MUNICIPALITY)

      const result = validateMunicipality(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Municipality must be a valid municipality')
      }
    },

    parseLiteral(ast: ValueNode): Municipality {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.MUNICIPALITY)

      const result = validateMunicipality(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Municipality must be a valid municipality')
      }
    }
  }),

  CountryCode: new GraphQLScalarType({
    description: 'CountryCode custom scalar type',
    name: 'CountryCode',

    serialize(value: CountryCode): ScalarCountryCode {
      return {
        type: ScalarType.COUNTRY_CODE,
        value: value.toString()
      }
    },

    parseValue(value: any): CountryCode {
      const scalarValue = parseScalarValue<string>(value, ScalarType.COUNTRY_CODE)

      const result = validateCountryCode(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('CountryCode must be a valid country code')
      }
    },

    parseLiteral(ast: ValueNode): CountryCode {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.COUNTRY_CODE)

      const result = validateCountryCode(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('CountryCode must be a valid country code')
      }
    }
  })
}
