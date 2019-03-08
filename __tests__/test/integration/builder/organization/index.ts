import { FinnishBusinessIds } from 'finnish-business-ids'
import KSUID from 'ksuid'
import { PoolClient } from 'pg'
import SQL from 'sql-template-strings'

import { Slug } from '@app/common/types'
import { tryGetOrganizationRecord } from '@app/organization/organizationRepository'
import { OrganizationRecord } from '@app/organization/types'
import { asSlug } from '@app/validation'
import { anAddress } from '@test/test/integration/builder/address'
import { clone } from '@test/util/clone'

class OrganizationBuilder {
  private slug: Slug = asSlug('slug')
  private name: string = 'name'

  constructor(private readonly client: PoolClient) {}

  public withSlug(slug: Slug): this {
    const c = clone(this)

    c.slug = slug

    return c
  }

  public async build(): Promise<OrganizationRecord> {
    const address = await anAddress(this.client).build()

    const ksuid = await KSUID.random()
    const businessId = FinnishBusinessIds.generateBusinessId()

    const insertResult = await this.client.query(
      SQL`
        INSERT INTO organization (
          ksuid,
          slug,
          name,
          business_id,
          address_id
        ) VALUES (
          ${ksuid.string},
          ${this.slug},
          ${this.name},
          ${businessId},
          ${address.id}
        ) RETURNING id
      `
    )

    return tryGetOrganizationRecord(this.client, insertResult.rows[0].id)
  }
}

export function anOrganization(client: PoolClient): OrganizationBuilder {
  return new OrganizationBuilder(client)
}
