import { format, parse } from 'date-fns'
import { GraphQLScalarType, Kind, ValueNode } from 'graphql'

export const scalarResolvers = {
  Date: new GraphQLScalarType({
    description: 'Date custom scalar type',
    name: 'Date',

    parseValue(value: any): Date | null {
      if (typeof value === 'string') {
        return parse(value)
      }

      return null
    },

    serialize(value: any): string | null {
      if (typeof value === 'string' || value instanceof Date) {
        return format(value, 'YYYY-MM-DD')
      }

      return null
    },

    parseLiteral(ast: ValueNode): Date | null {
      if (ast.kind === Kind.STRING) {
        return parse(ast.value)
      }

      return null
    }
  }),

  DateTime: new GraphQLScalarType({
    description: 'DateTime custom scalar type',
    name: 'DateTime',

    parseValue(value: any): Date | null {
      if (typeof value === 'string') {
        return parse(value)
      }

      return null
    },

    serialize(value: any): string | null {
      if (typeof value === 'string' || value instanceof Date) {
        return format(value)
      }

      return null
    },

    parseLiteral(ast: ValueNode): Date | null {
      if (ast.kind === Kind.STRING) {
        return parse(ast.value)
      }

      return null
    }
  })
}
