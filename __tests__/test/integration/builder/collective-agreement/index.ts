import KSUID from 'ksuid'
import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { tryGetCollectiveAgreementRecord } from '@app/collective-agreement/collectiveAgreementRepository'
import { CollectiveAgreementRecord } from '@app/collective-agreement/types'

class CollectiveAgreementBuilder {
  private name: string = 'Name'

  constructor(private readonly client: PoolClient) {}

  public async build(): Promise<CollectiveAgreementRecord> {
    const ksuid = await KSUID.random()

    const insertResult = await this.client.query(
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

    return tryGetCollectiveAgreementRecord(this.client, insertResult.rows[0].id)
  }
}

export function aCollectiveAgreement(client: PoolClient): CollectiveAgreementBuilder {
  return new CollectiveAgreementBuilder(client)
}
