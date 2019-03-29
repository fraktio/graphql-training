import DataLoader from 'dataloader'
import { PoolClient } from 'pg'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import {
  getOrganizationRecords,
  getOrganizationRecordsBySlugs
} from '@app/organization/organizationRepository'
import { OrganizationBySlugLoader, OrganizationLoader, OrganizationLoaders } from './types'

export class OrganizationLoaderFactory extends AbstractLoaderFactory<OrganizationLoaders> {
  protected createLoaders(client: PoolClient): OrganizationLoaders {
    const organizationLoader: OrganizationLoader = new DataLoader(async ids => {
      const organizations = await getOrganizationRecords(client, ids)

      organizations.forEach(organization =>
        organizationBySlugLoader.prime(organization.slug, organization)
      )

      return ids.map(id => organizations.find(organization => organization.id === id) || null)
    })

    const organizationBySlugLoader: OrganizationBySlugLoader = new DataLoader(async slugs => {
      const organizations = await getOrganizationRecordsBySlugs(client, slugs)

      organizations.forEach(organization => organizationLoader.prime(organization.id, organization))

      return slugs.map(
        slug => organizations.find(organization => organization.slug === slug) || null
      )
    })

    return {
      organizationBySlugLoader,
      organizationLoader
    }
  }
}
