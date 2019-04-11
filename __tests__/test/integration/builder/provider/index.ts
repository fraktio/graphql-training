import { FinnishBusinessIds } from 'finnish-business-ids'
import KSUID from 'ksuid'
import SQL from 'sql-template-strings'

import { Maybe, Slug } from '@app/common/types'
import { OrganizationRecord } from '@app/organization/types'
import { tryGetProviderRecord } from '@app/provider/providerRepository'
import { ProviderRecord } from '@app/provider/types'
import { PoolConnection } from '@app/util/database/types'
import { asSlug } from '@app/validation'
import { anAddress } from '@test/test/integration/builder/address'
import { anOrganization } from '@test/test/integration/builder/organization'
import { clone } from '@test/util/clone'

class ProviderBuilder {
  private slug: Slug = asSlug('slug')
  private name: string = 'provider'
  private organization: Maybe<OrganizationRecord> = null

  constructor(private readonly connection: PoolConnection) {}

  public withOrganization(organization: OrganizationRecord): this {
    const c = clone(this)

    c.organization = organization

    return c
  }

  public withSlug(slug: Slug): this {
    const c = clone(this)

    c.slug = slug

    return c
  }

  public async build(): Promise<ProviderRecord> {
    const organization = this.organization || (await anOrganization(this.connection).build())
    const address = await anAddress(this.connection).build()

    const ksuid = await KSUID.random()
    const businessId = FinnishBusinessIds.generateBusinessId()

    const insertResult = await this.connection.query(
      SQL`
        INSERT INTO provider (
          ksuid,
          organization_id,
          address_id,
          slug,
          name,
          business_id
        ) VALUES (
          ${ksuid.string},
          ${organization.id},
          ${address.id},
          ${this.slug},
          ${this.name},
          ${businessId}
        ) RETURNING id
      `
    )

    return tryGetProviderRecord(this.connection, insertResult.rows[0].id)
  }
}

export function aProvider(connection: PoolConnection): ProviderBuilder {
  return new ProviderBuilder(connection)
}
