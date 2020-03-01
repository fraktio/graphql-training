import { AddUserAccountInput, UserRecord } from './types'
import { Maybe, Try } from '@app/common/types'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'
import { toFailure, toSuccess } from '@app/common'

import KSUID from 'ksuid'
import { PoolConnection } from '@app/util/database/types'

export async function getUserByEmail(
  connection: PoolConnection,
  email: string
): Promise<Maybe<UserRecord>> {
  const result = await connection.query('SELECT * FROM user_account WHERE email = $1', [email])

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function tryGetUser(connection: PoolConnection, id: number): Promise<UserRecord> {
  const result = await connection.query('SELECT * FROM user_account WHERE id = $1', [id])

  const row = result.rows[0]

  if (!row) {
    throw new Error(`User not found with id ${id}`)
  }

  return toRecord(row)
}

type UserRow = {
  id: number
  ksuid: KSUID
  email: string
  password: string
  first_name: string
  last_name: string
}

function toRecord(row: UserRow): UserRecord {
  const { id, ksuid, email, password, first_name, last_name } = row

  return {
    id,
    ksuid,
    email,
    encryptedPassword: password,
    name: {
      firstName: first_name,
      lastName: last_name
    }
  }
}

export async function getUserByUuid(
  connection: PoolConnection,
  ksuid: KSUID
): Promise<Maybe<UserRecord>> {
  const result = await connection.query('SELECT * FROM user_account WHERE uuid = $1', [ksuid])

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function addUserAccount(
  connection: PoolConnection,
  input: AddUserAccountInput
): Promise<Try<UserRecord, UniqueConstraintViolationError>> {
  const { email, encryptedPassword, firstName, lastName } = input

  const userAccount = await withUniqueConstraintHandling(
    async () => {
      const ksuid = await KSUID.random()

      const insertResult = await connection.query(
        `INSERT INTO user_account (
          ksuid, email, password, first_name, last_name
        ) VALUES (
          $1, $2, $3, $4, $5
        ) RETURNING id`,
        [ksuid, email, encryptedPassword, firstName, lastName]
      )

      return tryGetUser(connection, insertResult.rows[0].id)
    },
    error => error.toString()
  )

  if (userAccount instanceof UniqueConstraintViolationError) {
    return toFailure(userAccount)
  }

  return toSuccess(userAccount)
}
