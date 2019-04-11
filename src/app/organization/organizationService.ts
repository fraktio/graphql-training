import KSUID from 'ksuid'

import { AddressLoader } from '@app/address/loader/types'
import { Maybe, Slug, Try } from '@app/common/types'
import { ProviderRecord } from '@app/provider/types'
import { UniqueConstraintViolationError } from '@app/util/database'
import { PoolConnection } from '@app/util/database/types'
import {
  OrganizationByKSUIDLoader,
  OrganizationBySlugLoader,
  OrganizationLoader,
  OrganizationLoaders
} from './loader/types'
import { editOrganizationRecord } from './organizationRepository'
import { EditOrganizationInput, OrganizationRecord } from './types'

export async function getOrganizationBySlug(
  organizationBySlugLoader: OrganizationBySlugLoader,
  slug: Slug
): Promise<Maybe<OrganizationRecord>> {
  return organizationBySlugLoader.load(slug)
}

export async function tryGetOrganizationByProvider(
  loader: OrganizationLoader,
  provider: ProviderRecord
): Promise<OrganizationRecord> {
  const organization = await loader.load(provider.organizationId)

  if (!organization) {
    throw new Error(`Organization was expected to be found with id ${provider.organizationId}`)
  }

  return organization
}

export async function getOrganizationByKsuid(
  organizationByKsuidLoader: OrganizationByKSUIDLoader,
  ksuid: KSUID
): Promise<Maybe<OrganizationRecord>> {
  return organizationByKsuidLoader.load(ksuid)
}

export async function editOrganization(
  loaders: OrganizationLoaders,
  addressLoader: AddressLoader,
  connection: PoolConnection,
  person: OrganizationRecord,
  input: EditOrganizationInput
): Promise<Try<OrganizationRecord, UniqueConstraintViolationError>> {
  const result = await editOrganizationRecord(connection, person, input)

  if (result.success) {
    const editedOrganization = result.value

    const { organizationLoader, organizationByKsuidLoader, organizationBySlugLoader } = loaders

    organizationLoader.clear(editedOrganization.id).prime(editedOrganization.id, editedOrganization)

    organizationByKsuidLoader
      .clear(editedOrganization.ksuid)
      .prime(editedOrganization.ksuid, editedOrganization)

    organizationBySlugLoader
      .clear(editedOrganization.slug)
      .prime(editedOrganization.slug, editedOrganization)

    addressLoader.clear(editedOrganization.addressId)
  }

  return result
}
