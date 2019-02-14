import { PoolClient } from 'pg'
import { CustomError } from 'ts-custom-error'

import { getPool } from '@src/setup/database'

const DATABASE_ERROR_UNIQUE_VIOLATION = '23505'

export class UniqueConstraintViolationError extends CustomError {
  public constructor(public readonly field: string, message?: string) {
    super(message)
  }
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()

  await client.query('BEGIN')

  try {
    const result = await callback(client)

    await client.query('COMMIT')

    return result
  } catch (e) {
    await client.query('ROLLBACK')

    throw e
  } finally {
    client.release()
  }
}

export async function withUniqueConstraintHandling<T>(
  callback: () => Promise<T>,
  errorField: (error: string) => string
): Promise<T | UniqueConstraintViolationError> {
  try {
    return await callback()
  } catch (error) {
    if (error.code === DATABASE_ERROR_UNIQUE_VIOLATION) {
      return new UniqueConstraintViolationError(errorField(error.detail))
    } else {
      throw error
    }
  }
}
