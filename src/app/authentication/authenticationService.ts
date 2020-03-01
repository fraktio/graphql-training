import { AuthenticatedUserRecord, AuthenticationTokenRecord, LoginInput, UserRecord } from './types'
import {
  addAuthenticationToken,
  deleteAuthenticationToken,
  getAuthenticationTokenByEncryptedToken
} from './authenticationTokenRepository'
import { createRandomIv, encryptTokenWithIv, getJwtPrivateKey } from '@src/util/crypto'
import { getUserByEmail, getUserByUuid, tryGetUser } from './authenticationRepository'

import { DurationInputArg2 } from 'moment'
import KSUID from 'ksuid'
import { Maybe } from '@app/common/types'
import { PoolClient } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import moment from 'moment'

type Time = {
  amount: number
  unit: DurationInputArg2
}

export function parseTokenFromAuthorizationHeader(authorization: string): Maybe<string> {
  const bearerLength = 'Bearer '.length

  if (authorization && authorization.length > bearerLength) {
    return authorization.slice(bearerLength)
  }

  return null
}

export async function getAuthenticatedUser(
  client: PoolClient,
  ksuid: KSUID,
  encryptedToken: string,
  expirationTime: Time,
  refreshTime: Time
): Promise<Maybe<AuthenticatedUserRecord>> {
  const authenticationToken = await getAuthenticationTokenByEncryptedToken(client, encryptedToken)
  const user = await getUserByUuid(client, ksuid)

  let currentAuthenticationToken

  if (authenticationToken && user && authenticationToken.userId === user.id) {
    currentAuthenticationToken = authenticationToken

    if (
      moment().isSameOrBefore(
        moment(authenticationToken.authenticatedAt).add(refreshTime.amount, refreshTime.unit)
      )
    ) {
      return {
        encryptedToken: currentAuthenticationToken.encryptedToken,
        user
      }
    }
  }

  return null
}

export async function generateAndAddAuthenticationToken(
  client: PoolClient,
  user: UserRecord,
  expirationTime: Time
): Promise<AuthenticationTokenRecord> {
  const iv = createRandomIv()

  const token = jwt.sign(
    { data: { ksuid: user.ksuid, iv: iv.toString('hex') } },
    getJwtPrivateKey(),
    {
      expiresIn: `${expirationTime.amount} ${expirationTime.unit}`
    }
  )

  const encryptedToken = encryptTokenWithIv(token, iv)
  return addAuthenticationToken(client, user, encryptedToken, moment().toDate())
}

export async function login(
  client: PoolClient,
  input: LoginInput,
  expirationTime: Time
): Promise<Maybe<AuthenticatedUserRecord>> {
  const { email, password } = input

  const user = await getUserByEmail(client, email)

  if (user) {
    const match = await bcrypt.compare(password, user.encryptedPassword)

    if (match) {
      const authenticationToken = await generateAndAddAuthenticationToken(
        client,
        user,
        expirationTime
      )

      return {
        user,
        encryptedToken: authenticationToken.encryptedToken
      }
    }
  } else {
    // User was not found but we'll still compare the password
    // to mitigate timing attacks.
    await bcrypt.compare(
      input.password,
      '$2a$12$aGpBRIHl0DZlsCn5.z2N4O4L/iDGU.inT4iApLUWrHATBtUikdNqC'
    )
  }

  return null
}

export async function logout(client: PoolClient, encryptedToken: string): Promise<string> {
  const authenticationToken = await getAuthenticationTokenByEncryptedToken(client, encryptedToken)

  if (authenticationToken) {
    await deleteAuthenticationToken(client, authenticationToken)
  }

  return encryptedToken
}

export async function refreshToken(
  client: PoolClient,
  encryptedToken: string,
  expirationTime: Time
): Promise<Maybe<AuthenticationTokenRecord>> {
  const authenticationToken = await getAuthenticationTokenByEncryptedToken(client, encryptedToken)

  if (authenticationToken) {
    const user = await tryGetUser(client, authenticationToken.userId)

    deleteAuthenticationToken(client, authenticationToken)

    return generateAndAddAuthenticationToken(client, user, expirationTime)
  }

  return null
}

export async function getAuthenticatedUserAndEncryptedAuthenticationToken(
  client: PoolClient,
  authorization: string,
  expirationTime: Time,
  refreshTime: Time
): Promise<{
  currentUser: Maybe<AuthenticatedUserRecord>
  encryptedAuthenticationToken: Maybe<string>
}> {
  const token = parseTokenFromAuthorizationHeader(authorization)

  let currentUser = null
  let encryptedAuthenticationToken = null

  if (token != null) {
    const decodedToken = await decodeToken(token)

    if (decodedToken) {
      const { ksuid, iv } = decodedToken

      encryptedAuthenticationToken = encryptToken(token, iv)

      currentUser = await getAuthenticatedUser(
        client,
        ksuid,
        encryptedAuthenticationToken,
        expirationTime,
        refreshTime
      )
    }
  }

  return {
    currentUser,
    encryptedAuthenticationToken
  }
}

type DecodedToken = {
  ksuid: KSUID
  iv: string
}

type DecodedWrapper = {
  data: DecodedToken
}

async function decodeToken(token: string): Promise<Maybe<DecodedToken>> {
  try {
    await jwt.verify(token, getJwtPrivateKey())
    const decodedToken = jwt.decode(token) as DecodedWrapper
    const data = decodedToken.data
    if (data != null) {
      const { ksuid, iv } = data

      return { ksuid, iv }
    }
    return null
  } catch (e) {
    return null
    // no-op
  }
}

function encryptToken(token: string, iv: string): string {
  return encryptTokenWithIv(Buffer.from(token), Buffer.from(iv, 'hex'))
}
