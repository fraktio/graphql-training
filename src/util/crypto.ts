import { ApolloError, AuthenticationError } from 'apollo-server-express'

import { Maybe } from '@app/common/types'
import { Secret } from 'jsonwebtoken'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

export function getJwtPrivateKey(): Secret {
  if (process.env.JWT_PRIVATE_KEY == null) {
    throw new ApolloError('env: JWT_PRIVATE_KEY missing!')
  }
  return process.env.JWT_PRIVATE_KEY
}

const algorithm = 'aes-256-ctr'
const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY || '' // Must be 32 characters (256 bits)

export function createRandomIv(): Buffer {
  const ivLength = 16

  return crypto.randomBytes(ivLength)
}

export function encryptToken(token: Buffer | string): string {
  return encryptTokenWithIv(token, createRandomIv())
}

export function encryptTokenWithIv(token: Buffer | string, iv: Buffer): string {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey), iv)

  let encrypted = cipher.update(token)

  encrypted = Buffer.concat([encrypted, cipher.final()])

  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decryptToken(token: string): string {
  const textParts = token.split(':')
  const shiftedTextParts = textParts.shift()
  if (shiftedTextParts == null) {
    throw new AuthenticationError('invalid token')
  }
  const iv = Buffer.from(shiftedTextParts, 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey), iv)

  let decrypted = decipher.update(encryptedText)

  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}
