import KSUID from 'ksuid'

export type UserRecord = {
  id: number
  ksuid: KSUID
  email: string
  encryptedPassword: string
  name: {
    firstName: string
    lastName: string
  }
  accessRights: AccessRight[]
}

export interface AuthenticatedUserRecord {
  user: UserRecord
  encryptedToken: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthenticationTokenRecord {
  id: number
  userId: number
  encryptedToken: string
  authenticatedAt: Date
}

export interface CreateNewUserAccountInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AddUserAccountInput {
  user: UserInput
}

export interface UserInput {
  email: string
  firstName: string
  lastName: string
  password: string
  accessRights: AccessRight[]
}

export interface CreateUserAccountInput {
  email: string
  encryptedPassword: string
  firstName: string
  lastName: string
  password: string
  accessRights: AccessRight[]
}

export enum AccessRight {
  PERSONAL = 'PERSONAL',
  RECRUITING = 'RECRUITING',
  SENSITIVE = 'SENSITIVE',
  ADMIN = 'ADMIN'
}
