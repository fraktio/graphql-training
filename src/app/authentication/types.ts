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
}

export type AuthenticatedUserRecord = {
  user: UserRecord
  encryptedToken: string
}

export type LoginInput = {
  email: string
  password: string
}

export type AuthenticationTokenRecord = {
  id: number
  userId: number
  encryptedToken: string
  authenticatedAt: Date
}

export type CreateNewUserAccountInput = {
  email: string
  password: string
  firstName: string
  lastName: string
}

export type AddUserAccountInput = {
  ksuid: KSUID
  email: string
  encryptedPassword: string
  firstName: string
  lastName: string
}
