import DataLoader from 'dataloader'

import { ID, Maybe, Slug } from '@app/common/types'
import { OrganizationRecord } from '@app/organization/types'

export interface OrganizationLoaders {
  organizationLoader: OrganizationLoader
  organizationBySlugLoader: OrganizationBySlugLoader
}

export type OrganizationLoader = DataLoader<ID, Maybe<OrganizationRecord>>
export type OrganizationBySlugLoader = DataLoader<Slug, Maybe<OrganizationRecord>>
