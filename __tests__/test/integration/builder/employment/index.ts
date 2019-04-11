import KSUID from 'ksuid'
import SQL from 'sql-template-strings'

import { CollectiveAgreementRecord } from '@app/collective-agreement/types'
import { Maybe } from '@app/common/types'
import { tryGetEmploymentRecord } from '@app/employment/employmentRepository'
import { EmploymentRecord, EmploymentType } from '@app/employment/types'
import { PersonRecord } from '@app/person/types'
import { ProviderRecord } from '@app/provider/types'
import { PoolConnection } from '@app/util/database/types'
import { aCollectiveAgreement } from '@test/test/integration/builder/collective-agreement'
import { aPerson } from '@test/test/integration/builder/person'
import { aProvider } from '@test/test/integration/builder/provider'
import { clone } from '@test/util/clone'

class EmploymentBuilder {
  private person: Maybe<PersonRecord> = null
  private provider: Maybe<ProviderRecord> = null
  private collectiveAgreement: Maybe<CollectiveAgreementRecord> = null
  private type: EmploymentType = EmploymentType.GENERAL_TERMS

  constructor(private readonly connection: PoolConnection) {}

  public withPerson(person: PersonRecord): this {
    const c = clone(this)

    c.person = person

    return c
  }

  public withProvider(provider: ProviderRecord): this {
    const c = clone(this)

    c.provider = provider

    return c
  }

  public withCollectiveAgreement(collectiveAgreement: CollectiveAgreementRecord): this {
    const c = clone(this)

    c.collectiveAgreement = collectiveAgreement

    return c
  }

  public async build(): Promise<EmploymentRecord> {
    const person = this.person || (await aPerson(this.connection).build())
    const provider = this.provider || (await aProvider(this.connection).build())
    const collectiveAgreement =
      this.collectiveAgreement || (await aCollectiveAgreement(this.connection).build())

    const ksuid = await KSUID.random()

    const insertResult = await this.connection.query(
      SQL`
        INSERT INTO employment (
          ksuid,
          person_id,
          provider_id,
          collective_agreement_id,
          type
        ) VALUES (
          ${ksuid.string},
          ${person.id},
          ${provider.id},
          ${collectiveAgreement.id},
          ${this.type}
        ) RETURNING id
      `
    )

    return tryGetEmploymentRecord(this.connection, insertResult.rows[0].id)
  }
}

export function anEmployment(connection: PoolConnection): EmploymentBuilder {
  return new EmploymentBuilder(connection)
}
