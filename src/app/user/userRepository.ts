import KSUID from 'ksuid'
import SQL from 'sql-template-strings'

import { Email } from '@app/address/types'
import { toFailure, toSuccess } from '@app/common'
import { ID, Maybe, Try } from '@app/common/types'
import { UserRecord } from '@app/user/types'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'
import { PoolConnection } from '@app/util/database/types'
import { asEmail, asId } from '@app/validation'

export async function getUserRecords(connection: PoolConnection, ids: ID[]): Promise<UserRecord[]> {
  const result = await connection.query(SQL`SELECT * FROM user_account WHERE id = ANY (${ids})`)

  return result.rows.map(row => toRecord(row))
}

export async function getUserRecord(
  connection: PoolConnection,
  id: ID
): Promise<Maybe<UserRecord>> {
  const result = await connection.query(SQL`SELECT * FROM user_account WHERE id = ${id}`)

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function tryGetUserRecord(connection: PoolConnection, id: ID): Promise<UserRecord> {
  const user = await getUserRecord(connection, id)

  if (!user) {
    throw new Error(`User was expected to be found with id ${id}`)
  }

  return user
}

interface UserRow
  extends Readonly<{
    id: number
    email: string
    password: string
  }> {}

function toRecord(row: UserRow): UserRecord {
  const { id, email } = row

  return {
    email: asEmail(email),
    id: asId(id)
  }
}

export async function addUserRecordForPerson(
  connection: PoolConnection,
  email: Email
): Promise<Try<UserRecord, UniqueConstraintViolationError>> {
  // password is foobar
  const password = '$2a$12$aGpBRIHl0DZlsCn5.z2N4O4L/iDGU.inT4iApLUWrHATBtUikdNqC'

  const ksuid = await KSUID.random()

  const result = await withUniqueConstraintHandling(
    async () => {
      const insertResult = await connection.query(
        SQL`
          INSERT INTO user_account (
            ksuid,
            email,
            password
          ) VALUES (
            ${ksuid.string},
            ${email},
            ${password}
          ) RETURNING id
        `
      )

      return tryGetUserRecord(connection, insertResult.rows[0].id)
    },
    () => 'email'
  )

  if (result instanceof UniqueConstraintViolationError) {
    return toFailure(result)
  }

  return toSuccess(result)
}

export async function editUserRecord(
  connection: PoolConnection,
  user: UserRecord,
  email: Email
): Promise<Try<UserRecord, UniqueConstraintViolationError>> {
  const result = await withUniqueConstraintHandling(
    async () => {
      await connection.query(
        SQL`
          UPDATE user_account
          SET
            email = ${email}
          WHERE
            id = ${user.id}
        `
      )

      return tryGetUserRecord(connection, user.id)
    },
    () => 'email'
  )

  if (result instanceof UniqueConstraintViolationError) {
    return toFailure(result)
  }

  return toSuccess(result)
}
