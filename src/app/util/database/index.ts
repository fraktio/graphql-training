import { CustomError } from 'ts-custom-error'

import { getPool } from '@src/setup/database'
import { PoolConnection } from './types'

const DATABASE_ERROR_UNIQUE_VIOLATION = '23505'

export class UniqueConstraintViolationError extends CustomError {
  public constructor(public readonly field: string, message?: string) {
    super(message)
  }
}

export async function transaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().connect()

  await connection.query('BEGIN')

  try {
    const result = await callback(connection)

    await connection.query('COMMIT')

    return result
  } catch (e) {
    await connection.query('ROLLBACK')

    throw e
  } finally {
    connection.release()
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
