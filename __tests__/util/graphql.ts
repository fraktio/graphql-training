import { DocumentNode, ExecutionResult, graphql, GraphQLError } from 'graphql'
import { print } from 'graphql/language'

import { Context } from '@app/graphql/types'
import { createSchema } from '@src/util/graphql'

const schema = createSchema()

async function execute<T>(
  gql: DocumentNode,
  variables: { [key: string]: any },
  context: Context
): Promise<ExecutionResult<T>> {
  const rootValue = {}

  return graphql<T>(schema, print(gql), rootValue, context, variables)
}

export async function executeAsSuccess<T>(
  gql: DocumentNode,
  variables: { [key: string]: any },
  context: Context
): Promise<T> {
  const result = await execute<T>(gql, variables, context)

  if (result.errors != null || result.data == null) {
    throw new Error('Expected success but got: ' + JSON.stringify(result, null, 2))
  }

  return result.data
}

export async function executeAsFailure(
  gql: DocumentNode,
  variables: { [key: string]: any },
  context: Context
): Promise<ReadonlyArray<GraphQLError>> {
  const result = await execute(gql, variables, context)

  if (result.data != null || result.errors == null) {
    throw new Error('Expected errors but got: ' + JSON.stringify(result, null, 2))
  }

  return result.errors
}
