import DataLoader from 'dataloader'
import KSUID from 'ksuid'

import { ID, Maybe, Slug } from '@app/common/types'
import { OrganizationRecord } from '@app/organization/types'

export interface OrganizationLoaders
  extends Readonly<{
    organizationLoader: OrganizationLoader
    organizationBySlugLoader: OrganizationBySlugLoader
    organizationByKsuidLoader: OrganizationByKSUIDLoader
  }> {}

export type OrganizationLoader = DataLoader<ID, Maybe<OrganizationRecord>>
export type OrganizationBySlugLoader = DataLoader<Slug, Maybe<OrganizationRecord>>
export type OrganizationByKSUIDLoader = DataLoader<KSUID, Maybe<OrganizationRecord>>
