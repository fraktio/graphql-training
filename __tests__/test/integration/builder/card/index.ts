import KSUID from 'ksuid'
import SQL from 'sql-template-strings'

import { tryGetCardRecord } from '@app/card/cardRepository'
import { CardRecord } from '@app/card/types'
import { PoolConnection } from '@app/util/database/types'

class CardBuilder {
  private cardType: string = 'test'

  constructor(private readonly connection: PoolConnection) {}

  public async build(): Promise<CardRecord> {
    const ksuid = await KSUID.random()

    const insertResult = await this.connection.query(
      SQL`
        INSERT INTO card (
          ksuid,
          type,
        ) VALUES (
          ${ksuid.string},
          ${this.cardType},
        ) RETURNING id
      `
    )

    return tryGetCardRecord(this.connection, insertResult.rows[0].id)
  }
}

export function aCard(connection: PoolConnection): CardBuilder {
  return new CardBuilder(connection)
}
