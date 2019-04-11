import KSUID from 'ksuid'
import SQL from 'sql-template-strings'

import { Email } from '@app/address/types'
import { UserRecord } from '@app/user/types'
import { tryGetUserRecord } from '@app/user/userRepository'
import { PoolConnection } from '@app/util/database/types'
import { asEmail } from '@app/validation'

class UserBuilder {
  private email: Email = asEmail('test@user.com')
  private password: string = '$2y$12$6JA85AQYlkwIZQr2Gg4oJOY2LeCB1BKlGIwuooq4tZ6WGnmUfXDn2' // test

  constructor(private readonly connection: PoolConnection) {}

  public async build(): Promise<UserRecord> {
    const ksuid = await KSUID.random()

    const insertResult = await this.connection.query(
      SQL`
        INSERT INTO user_account (
          ksuid,
          email,
          password
        ) VALUES (
          ${ksuid.string},
          ${this.email},
          ${this.password}
        ) RETURNING id
      `
    )

    return tryGetUserRecord(this.connection, insertResult.rows[0].id)
  }
}

export function aUser(connection: PoolConnection): UserBuilder {
  return new UserBuilder(connection)
}
