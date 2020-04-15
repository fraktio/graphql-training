import { AuthenticationTokenRecord, UserRecord } from './types'

import { Maybe } from '@app/common/types'
import { PoolClient } from 'pg'

export async function getAuthenticationToken(
  client: PoolClient,
  id: number
): Promise<Maybe<AuthenticationTokenRecord>> {
  const result = await client.query('SELECT * FROM authentication_token WHERE id = $1', [id])

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function getAuthenticationTokenByEncryptedToken(
  client: PoolClient,
  encryptedToken: string
): Promise<Maybe<AuthenticationTokenRecord>> {
  const result = await client.query('SELECT * FROM authentication_token WHERE token = $1', [
    encryptedToken
  ])

  const row = result.rows[0]

  return row ? toRecord(row) : null
}

export async function tryGetAuthenticationToken(
  client: PoolClient,
  id: number
): Promise<AuthenticationTokenRecord> {
  const authenticationToken = await getAuthenticationToken(client, id)

  if (!authenticationToken) {
    throw new Error(`Authentication Token not found with id ${id}`)
  }

  return authenticationToken
}

type AuthenticationTokenRow = {
  id: number
  user_account_id: number
  token: string
  authenticated_at: Date
}

function toRecord(row: AuthenticationTokenRow): AuthenticationTokenRecord {
  const { id, user_account_id, token, authenticated_at } = row

  return {
    id,
    userId: user_account_id,
    encryptedToken: token,
    authenticatedAt: authenticated_at
  }
}

export async function addAuthenticationToken(
  client: PoolClient,
  user: UserRecord,
  token: string,
  authenticatedAt: Date
): Promise<AuthenticationTokenRecord> {
  const insertResult = await client.query(
    `
      INSERT INTO authentication_token (
        user_account_id,
        token,
        authenticated_at
      )
      VALUES ($1, $2, $3)
      RETURNING id
    `,
    [user.id, token, authenticatedAt]
  )

  return tryGetAuthenticationToken(client, insertResult.rows[0].id)
}

export async function getAuthenticationTokens(
  client: PoolClient,
  user: UserRecord
): Promise<Array<AuthenticationTokenRecord>> {
  const result = await client.query(
    'SELECT * FROM authentication_token WHERE user_account_id = $1',
    [user.id]
  )

  return result.rows.map(row => toRecord(row))
}

export async function deleteAuthenticationToken(
  client: PoolClient,
  authenticationToken: AuthenticationTokenRecord
): Promise<void> {
  await client.query('DELETE FROM authentication_token WHERE id = $1', [authenticationToken.id])
}
