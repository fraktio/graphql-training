import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { UserRecord } from '@app/user/types'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'

export async function getUsers(client: PoolClient, ids: number[]): Promise<UserRecord[]> {
  const result = await client.query(SQL`SELECT * FROM user_account WHERE id = ANY (${ids})`)

  return result.rows.map(row => toRecord(row))
}

export async function getUser(client: PoolClient, id: number): Promise<UserRecord | null> {
  const result = await client.query(SQL`SELECT * FROM user_account WHERE id = ${id}`)

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

async function tryGetUser(client: PoolClient, id: number): Promise<UserRecord> {
  const user = await getUser(client, id)

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
    email,
    id
  }
}

export async function addUserForPerson(
  client: PoolClient,
  email: string
): Promise<UserRecord | UniqueConstraintViolationError> {
  // password is foobar
  const password = '$2a$12$aGpBRIHl0DZlsCn5.z2N4O4L/iDGU.inT4iApLUWrHATBtUikdNqC'

  return withUniqueConstraintHandling(
    async () => {
      const insertResult = await client.query(
        SQL`
        INSERT INTO user_account (
          email,
          password
        ) VALUES (
          ${email},
          ${password}
        ) RETURNING id
      `
      )

      return tryGetUser(client, insertResult.rows[0].id)
    },
    () => 'email'
  )
}
