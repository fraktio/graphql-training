import KSUID from 'ksuid'

import { Maybe, Slug } from '@app/common/types'
import { getEmploymentsByProviderPerson } from '@app/employment/employmentService'
import { EmploymentRecord } from '@app/employment/types'
import { Context } from '@app/graphql/types'
import { tryGetOrganizationByProvider } from '@app/organization/organizationService'
import { OrganizationRecord } from '@app/organization/types'
import { getPersonsByProvider, tryGetPersonByProviderPerson } from '@app/person/personService'
import { PersonRecord } from '@app/person/types'
import {
  getProviderBySlugs,
  getProviderPersonBySlugsAndPersonKsuid
} from '@app/provider/providerService'
import { ProviderPersonRecord, ProviderRecord } from '@app/provider/types'
import { transaction } from '@app/util/database'
import { Root } from './types'

interface ProviderArgs {
  organizationSlug: Slug
  providerSlug: Slug
}

interface ProviderPersonArgs {
  organizationSlug: Slug
  providerSlug: Slug
  personKsuid: KSUID
}

export const providerResolvers = {
  Provider: {
    async providerPersons(
      provider: ProviderRecord,
      _: {},
      { loaderFactories: { personLoaderFactory } }: Context
    ): Promise<ProviderPersonRecord[]> {
      return transaction(async connection => {
        return (await getPersonsByProvider(
          personLoaderFactory.getLoaders(connection),
          connection,
          provider
        )).map(person => ({
          personId: person.id,
          providerId: provider.id
        }))
      })
    },

    async organization(
      provider: ProviderRecord,
      _: {},
      { loaderFactories: { organizationLoaderFactory } }: Context
    ): Promise<OrganizationRecord> {
      return transaction(async connection => {
        return tryGetOrganizationByProvider(
          organizationLoaderFactory.getLoaders(connection).organizationLoader,
          provider
        )
      })
    }
  },

  ProviderPerson: {
    async person(
      providerPerson: ProviderPersonRecord,
      _: {},
      { loaderFactories: { personLoaderFactory } }: Context
    ): Promise<PersonRecord> {
      return transaction(async connection => {
        return tryGetPersonByProviderPerson(
          personLoaderFactory.getLoaders(connection),
          providerPerson
        )
      })
    },

    async employments(
      providerPerson: ProviderPersonRecord,
      _: {},
      { loaderFactories: { employmentLoaderFactory } }: Context
    ): Promise<EmploymentRecord[]> {
      return transaction(async connection => {
        return getEmploymentsByProviderPerson(
          employmentLoaderFactory.getLoaders(connection),
          connection,
          providerPerson
        )
      })
    }
  },

  Query: {
    async provider(
      _: Root,
      args: ProviderArgs,
      { loaderFactories: { providerLoaderFactory } }: Context
    ): Promise<Maybe<ProviderRecord>> {
      return transaction(async connection => {
        return getProviderBySlugs(
          providerLoaderFactory.getLoaders(connection),
          connection,
          args.organizationSlug,
          args.providerSlug
        )
      })
    },

    async providerPerson(_: Root, args: ProviderPersonArgs): Promise<Maybe<ProviderPersonRecord>> {
      return transaction(async connection => {
        return getProviderPersonBySlugsAndPersonKsuid(
          connection,
          args.organizationSlug,
          args.providerSlug,
          args.personKsuid
        )
      })
    }
  }
}
