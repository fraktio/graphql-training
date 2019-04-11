import DataLoader from 'dataloader'

import { AbstractLoaderFactory } from '@app/loader/AbstractLoaderFactory'
import {
  getOrganizationRecords,
  getOrganizationRecordsByKsuids,
  getOrganizationRecordsBySlugs
} from '@app/organization/organizationRepository'
import { PoolConnection } from '@app/util/database/types'
import {
  OrganizationByKSUIDLoader,
  OrganizationBySlugLoader,
  OrganizationLoader,
  OrganizationLoaders
} from './types'

export class OrganizationLoaderFactory extends AbstractLoaderFactory<OrganizationLoaders> {
  protected createLoaders(connection: PoolConnection): OrganizationLoaders {
    const organizationLoader: OrganizationLoader = new DataLoader(async ids => {
      const organizations = await getOrganizationRecords(connection, ids)

      organizations.forEach(organization => {
        organizationBySlugLoader.prime(organization.slug, organization)
        organizationByKsuidLoader.prime(organization.ksuid, organization)
      })

      return ids.map(id => organizations.find(organization => organization.id === id) || null)
    })

    const organizationBySlugLoader: OrganizationBySlugLoader = new DataLoader(async slugs => {
      const organizations = await getOrganizationRecordsBySlugs(connection, slugs)

      organizations.forEach(organization => {
        organizationLoader.prime(organization.id, organization)
        organizationByKsuidLoader.prime(organization.ksuid, organization)
      })

      return slugs.map(
        slug => organizations.find(organization => organization.slug === slug) || null
      )
    })

    const organizationByKsuidLoader: OrganizationByKSUIDLoader = new DataLoader(async ksuids => {
      const organizations = await getOrganizationRecordsByKsuids(connection, ksuids)

      organizations.forEach(organization => {
        organizationLoader.prime(organization.id, organization)
        organizationBySlugLoader.prime(organization.slug, organization)
      })

      return ksuids.map(
        ksuid => organizations.find(organization => organization.ksuid.equals(ksuid)) || null
      )
    })

    return {
      organizationByKsuidLoader,
      organizationBySlugLoader,
      organizationLoader
    }
  }
}
