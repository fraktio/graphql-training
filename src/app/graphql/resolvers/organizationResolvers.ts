import { tryGetAddress } from '@app/address/addressService'
import { AddressRecord } from '@app/address/types'
import { Maybe, Slug } from '@app/common/types'
import { ValidationErrorCode, ValidationErrors } from '@app/graphql/schema/types'
import { Context, NotFoundError } from '@app/graphql/types'
import {
  editOrganization,
  getOrganizationByKsuid,
  getOrganizationBySlug
} from '@app/organization/organizationService'
import { EditOrganizationInput, OrganizationRecord } from '@app/organization/types'
import { getProvidersByOrganization } from '@app/provider/providerService'
import { ProviderRecord } from '@app/provider/types'
import { transaction } from '@app/util/database'
import { Root } from './types'

export type EditOrganizationOutput = EditOrganizationSuccess | ValidationErrors

interface EditOrganizationSuccess
  extends Readonly<{
    organization: OrganizationRecord
    success: true
  }> {}

export interface EditOrganizationArgs
  extends Readonly<{
    input: EditOrganizationInput
  }> {}

export const organizationResolvers = {
  Organization: {
    async address(
      organization: OrganizationRecord,
      _: {},
      { loaderFactories: { addressLoaderFactory } }: Context
    ): Promise<AddressRecord> {
      return transaction(async client => {
        return tryGetAddress(addressLoaderFactory.getLoaders(client), organization.addressId)
      })
    },

    async providers(
      organization: OrganizationRecord,
      _: {},
      { loaderFactories: { providerLoaderFactory } }: Context
    ): Promise<ProviderRecord[]> {
      return transaction(async client => {
        return getProvidersByOrganization(
          providerLoaderFactory.getLoaders(client),
          client,
          organization
        )
      })
    }
  },

  EditOrganizationOutput: {
    __resolveType(editOrganizationOutput: EditOrganizationOutput): string {
      return editOrganizationOutput.success ? 'EditOrganizationSuccess' : 'ValidationErrors'
    }
  },

  Query: {
    async organization(
      _: Root,
      args: { slug: Slug },
      { loaderFactories: { organizationLoaderFactory } }: Context
    ): Promise<Maybe<OrganizationRecord>> {
      return transaction(async client => {
        return getOrganizationBySlug(
          organizationLoaderFactory.getLoaders(client).organizationBySlugLoader,
          args.slug
        )
      })
    }
  },

  Mutation: {
    async editOrganization(
      _: Root,
      { input }: EditOrganizationArgs,
      { loaderFactories: { organizationLoaderFactory, addressLoaderFactory } }: Context
    ): Promise<EditOrganizationOutput> {
      return transaction(async client => {
        const { ksuid } = input

        const organizationLoaders = organizationLoaderFactory.getLoaders(client)

        const organization = await getOrganizationByKsuid(
          organizationLoaders.organizationByKsuidLoader,
          ksuid
        )

        if (!organization) {
          throw new NotFoundError('Organization was not found')
        }

        const result = await editOrganization(
          organizationLoaders,
          addressLoaderFactory.getLoaders(client),
          client,
          organization,
          input
        )

        if (result.success) {
          return {
            organization: result.value,
            success: true as const
          }
        } else {
          return {
            success: false as const,
            validationErrors: [
              {
                code: ValidationErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
                field: result.error.field
              }
            ]
          }
        }
      })
    }
  }
}
