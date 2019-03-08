import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { ID, Maybe } from '@app/common/types'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getOrganizationRecords } from './organizationRepository'
import { OrganizationRecord } from './types'

export type OrganizationLoader = DataLoader<ID, Maybe<OrganizationRecord>>

export class OrganizationLoaderFactory extends AbstractLoaderFactory<OrganizationLoader> {
  protected createLoader(client: PoolClient): OrganizationLoader {
    return new DataLoader(async ids => {
      const organizations = await getOrganizationRecords(client, ids)

      return ids.map(id => organizations.find(organization => organization.id === id) || null)
    })
  }
}
