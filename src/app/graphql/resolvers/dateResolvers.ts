import { format, isValid, parse } from 'date-fns'
import { GraphQLError, GraphQLScalarType, Kind, ObjectFieldNode, ValueNode } from 'graphql'

enum DateScalars {
  DATE = 'DATE',
  DATETIME = 'DATETIME'
}

interface DateOutput {
  type: DateScalars.DATE
  value: string
}

interface DateTimeOutput {
  type: DateScalars.DATETIME
  value: string
}

export const dateResolvers = {
  Date: new GraphQLScalarType({
    description: 'Date custom scalar type',
    name: 'Date',

    serialize(value: Date): DateOutput {
      return {
        type: DateScalars.DATE,
        value: format(value, 'YYYY-MM-DD')
      }
    },

    parseValue(value: any): Date {
      if (typeof value !== 'object') {
        throw new GraphQLError(`Date type should be Object, found ${value} (${typeof value})`)
      }

      if (Object.keys(value).length !== 2) {
        throw new GraphQLError(`Date needs to be exactly two fields, "type" and "value"`)
      }

      if (value.type !== DateScalars.DATE) {
        throw new GraphQLError(`Date needs a field named "type" with value "DATE"`)
      }

      if (!isValidDate(value.value)) {
        throw new GraphQLError(
          `Date needs a field named "value" with a value in format "YYYY-MM-DD"`
        )
      }

      return parse(value.value)
    },

    parseLiteral(ast: ValueNode): Date {
      if (ast.kind !== Kind.OBJECT) {
        throw new GraphQLError(`Date type should be Object, found ${ast.kind}`)
      }

      if (ast.fields.length !== 2) {
        throw new GraphQLError(`Date needs to be exactly two fields, "type" and "value"`)
      }

      if (!ast.fields.some(field => isTypeField(field, DateScalars.DATE))) {
        throw new GraphQLError(`Date needs a field named "type" with value "DATE"`)
      }

      const valueField = ast.fields.find(field => field.name.value === 'value')

      if (!valueField || valueField.value.kind !== Kind.STRING || !isValueFieldDate(valueField)) {
        throw new GraphQLError(
          `Date needs a field named "value" with a value in format "YYYY-MM-DD"`
        )
      }

      return parse(valueField.value.value)
    }
  }),

  DateTime: new GraphQLScalarType({
    description: 'DateTime custom scalar type',
    name: 'DateTime',

    serialize(value: Date): DateTimeOutput {
      return {
        type: DateScalars.DATETIME,
        value: format(value)
      }
    },

    parseValue(value: any): Date {
      if (typeof value !== 'object') {
        throw new GraphQLError(`DateTime type should be Object, found ${value} (${typeof value})`)
      }

      if (Object.keys(value).length !== 2) {
        throw new GraphQLError(`DateTime needs to be exactly two fields, "type" and "value"`)
      }

      if (value.type !== DateScalars.DATETIME) {
        throw new GraphQLError(`DateTime needs a field named "type" with value "DATETIME"`)
      }

      if (!isValidDateTime(value.value)) {
        throw new GraphQLError(
          `DateTime needs a field named "value" with a value in format "YYYY-MM-DDTHH:mm:ss.SSSZ"`
        )
      }

      return parse(value.value)
    },

    parseLiteral(ast: ValueNode): Date {
      if (ast.kind !== Kind.OBJECT) {
        throw new GraphQLError(`DateTime type should be Object, found ${ast.kind}`)
      }

      if (ast.fields.length !== 2) {
        throw new GraphQLError(`DateTime needs to be exactly two fields, "type" and "value"`)
      }

      if (!ast.fields.some(field => isTypeField(field, DateScalars.DATETIME))) {
        throw new GraphQLError(`Date needs a field named "type" with value "DATETIME"`)
      }

      const valueField = ast.fields.find(field => field.name.value === 'value')

      if (
        !valueField ||
        valueField.value.kind !== Kind.STRING ||
        !isValueFieldDateTime(valueField)
      ) {
        throw new GraphQLError(
          `Date needs a field named "value" with a value in format "YYYY-MM-DDTHH:mm:ss.SSSZ"`
        )
      }

      return parse(valueField.value.value)
    }
  })
}

function isTypeField(field: ObjectFieldNode, type: string): boolean {
  if (field.name.value !== 'type') {
    return false
  }

  if (field.value.kind !== Kind.STRING) {
    return false
  }

  if (field.value.value !== type) {
    return false
  }

  return true
}

function isValueFieldDate(field: ObjectFieldNode): boolean {
  const { name, value } = field

  if (name.value !== 'value') {
    return false
  }

  if (value.kind !== Kind.STRING) {
    return false
  }

  return isValidDate(value.value)
}

function isValidDate(value: string): boolean {
  const date = parse(value)

  if (!isValid(date) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  return true
}

function isValueFieldDateTime(field: ObjectFieldNode): boolean {
  const { name, value } = field

  if (name.value !== 'value') {
    return false
  }

  if (value.kind !== Kind.STRING) {
    return false
  }

  return isValidDateTime(value.value)
}

function isValidDateTime(value: string): boolean {
  const date = parse(value)

  if (!isValid(date) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return false
  }

  return true
}
