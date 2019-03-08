import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { Maybe, Slug } from '@app/common/types'
import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import { getOrganizationRecordsBySlugs } from './organizationRepository'
import { OrganizationRecord } from './types'

export type OrganizationBySlugLoader = DataLoader<Slug, Maybe<OrganizationRecord>>

export class OrganizationBySlugLoaderFactory extends AbstractLoaderFactory<
  OrganizationBySlugLoader
> {
  protected createLoader(client: PoolClient): OrganizationBySlugLoader {
    return new DataLoader(async slugs => {
      const organizations = await getOrganizationRecordsBySlugs(client, slugs)

      return slugs.map(
        slug => organizations.find(organization => organization.slug === slug) || null
      )
    })
  }
}
