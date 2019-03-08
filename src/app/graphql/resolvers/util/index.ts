import { GraphQLError, Kind, ObjectFieldNode, ValueNode } from 'graphql'

import { ScalarType } from '@app/graphql/resolvers/types'

export function parseScalarValue<T>(value: any, type: ScalarType): T {
  if (typeof value !== 'object') {
    throw new GraphQLError(`Scalar type should be an Object, found ${value} (${typeof value})`)
  }

  if (Object.keys(value).length !== 2) {
    throw new GraphQLError(`Scalar type needs to be exactly two fields, "type" and "value"`)
  }

  if (value.type !== type) {
    throw new GraphQLError(`Scalar type needs a field named "type" with value "${type}"`)
  }

  return value.value
}

export function parseScalarLiteral(ast: ValueNode, type: ScalarType): string {
  if (ast.kind !== Kind.OBJECT) {
    throw new GraphQLError(`Scalar type should be an Object, found ${ast.kind}`)
  }

  if (ast.fields.length !== 2) {
    throw new GraphQLError(`Scalar type needs to be exactly two fields, "type" and "value"`)
  }

  if (!ast.fields.some(field => isTypeField(field, type))) {
    throw new GraphQLError(`Scalar type needs a field named "type" with value "${type}"`)
  }

  const valueField = ast.fields.find(field => field.name.value === 'value')

  if (!valueField) {
    throw new GraphQLError(`Scalar type needs a field named "value"`)
  }

  if (valueField.value.kind !== Kind.STRING) {
    throw new GraphQLError(`Scalar type needs a field named "value" with type "string"`)
  }

  return valueField.value.value
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
