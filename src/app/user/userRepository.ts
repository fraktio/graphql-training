import KSUID from 'ksuid'
import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { ID, Maybe } from '@app/common/types'
import { UserRecord } from '@app/user/types'
import { UniqueConstraintViolationError, withUniqueConstraintHandling } from '@app/util/database'
import { asId } from '@app/validation'

export async function getUserRecords(client: PoolClient, ids: ID[]): Promise<UserRecord[]> {
  const result = await client.query(SQL`SELECT * FROM user_account WHERE id = ANY (${ids})`)

  return result.rows.map(row => toRecord(row))
}

export async function getUserRecord(client: PoolClient, id: ID): Promise<Maybe<UserRecord>> {
  const result = await client.query(SQL`SELECT * FROM user_account WHERE id = ${id}`)

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function tryGetUserRecord(client: PoolClient, id: ID): Promise<UserRecord> {
  const user = await getUserRecord(client, id)

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
    id: asId(id)
  }
}

export async function addUserRecordForPerson(
  client: PoolClient,
  email: string
): Promise<UserRecord | UniqueConstraintViolationError> {
  // password is foobar
  const password = '$2a$12$aGpBRIHl0DZlsCn5.z2N4O4L/iDGU.inT4iApLUWrHATBtUikdNqC'

  const ksuid = await KSUID.random()

  return withUniqueConstraintHandling(
    async () => {
      const insertResult = await client.query(
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

      return tryGetUserRecord(client, insertResult.rows[0].id)
    },
    () => 'email'
  )
}
