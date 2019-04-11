import KSUID from 'ksuid'
import SQL from 'sql-template-strings'

import { tryGetCollectiveAgreementRecord } from '@app/collective-agreement/collectiveAgreementRepository'
import { CollectiveAgreementRecord } from '@app/collective-agreement/types'
import { PoolConnection } from '@app/util/database/types'

class CollectiveAgreementBuilder {
  private name: string = 'Name'

  constructor(private readonly connection: PoolConnection) {}

  public async build(): Promise<CollectiveAgreementRecord> {
    const ksuid = await KSUID.random()

    const insertResult = await this.connection.query(
      SQL`
        INSERT INTO collective_agreement (
          ksuid,
          name
        ) VALUES (
          ${ksuid.string},
          ${this.name}
        ) RETURNING id
      `
    )

    return tryGetCollectiveAgreementRecord(this.connection, insertResult.rows[0].id)
  }
}

export function aCollectiveAgreement(connection: PoolConnection): CollectiveAgreementBuilder {
  return new CollectiveAgreementBuilder(connection)
}
