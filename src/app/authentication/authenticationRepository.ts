import { AccessRight, CreateUserAccountInput, UserRecord } from './types'
import { Maybe, Try } from '@app/common/types'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'
import { toFailure, toSuccess } from '@app/common'

import KSUID from 'ksuid'
import { PoolConnection } from '@app/util/database/types'
import SQL from 'sql-template-strings'

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

interface UserRow
  extends Readonly<{
    id: number
    ksuid: KSUID
    email: string
    password: string
    first_name: string
    last_name: string
    access_rights: string
  }> {}

function toRecord(row: UserRow): UserRecord {
  const { id, ksuid, email, password, first_name, last_name, access_rights } = row

  return {
    id,
    ksuid,
    email,
    encryptedPassword: password,
    name: {
      firstName: first_name,
      lastName: last_name
    },
    accessRights: toAccessRights(access_rights)
  }
}

function toAccessRights(accessRights: string): AccessRight[] {
  const rights = accessRights.match(/[A-Z]+/g)

  return rights ? rights.map(rights => AccessRight[rights as AccessRight]) : []
}

export async function getUserByUuid(
  connection: PoolConnection,
  ksuid: KSUID
): Promise<Maybe<UserRecord>> {
  const result = await connection.query('SELECT * FROM user_account WHERE ksuid = $1', [ksuid])

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function createUserAccount(
  connection: PoolConnection,
  input: CreateUserAccountInput
): Promise<Try<UserRecord, UniqueConstraintViolationError>> {
  const { email, encryptedPassword, firstName, lastName, password, accessRights } = input

  const userAccount = await withUniqueConstraintHandling(
    async () => {
      const ksuid = await KSUID.random()
      const insertResult = await connection.query(
        SQL`INSERT INTO user_account (
          ksuid, email, password, first_name, last_name, access_rights
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING id`,
        [ksuid.string, email, encryptedPassword, firstName, lastName, accessRights]
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
