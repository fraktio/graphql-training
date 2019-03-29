import { gql } from 'apollo-server-express'

import { KsuidOutput, ScalarType } from '@app/graphql/resolvers/types'
import { createLoaderFactories } from '@app/loader'
import { transaction } from '@app/util/database'
import { anEmployment, anOrganization, aPerson, aProvider } from '@test/test/integration/builder'
import { truncateDatabase } from '@test/util/database'
import { executeAsSuccess } from '@test/util/graphql'
import { toScalarKsuid } from '@test/util/scalar'
import { asyncTest } from '@test/util/test'

beforeEach(truncateDatabase)

const getPersonQuery = gql`
  query GetProviderPerson($organizationSlug: Slug!, $providerSlug: Slug!, $personKsuid: KSUID!) {
    providerPerson(
      organizationSlug: $organizationSlug
      providerSlug: $providerSlug
      personKsuid: $personKsuid
    ) {
      person {
        ksuid
      }
    }
  }
`

interface GetProviderPersonResponse
  extends Readonly<{
    providerPerson: ProviderPerson
  }> {}

interface ProviderPerson
  extends Readonly<{
    person: Person
  }> {}

interface Person
  extends Readonly<{
    ksuid: KsuidOutput
  }> {}

describe('provider person get', () => {
  it('gets a provider person', async done => {
    asyncTest(done, async () => {
      const [organization, provider, person] = await transaction(async client => {
        const organizationRecord = await anOrganization(client).build()

        const providerRecord = await aProvider(client)
          .withOrganization(organizationRecord)
          .build()

        const personRecord = await aPerson(client).build()

        await anEmployment(client)
          .withProvider(providerRecord)
          .withPerson(personRecord)
          .build()

        return Promise.all([organizationRecord, providerRecord, personRecord])
      })

      const context = {
        loaderFactories: createLoaderFactories()
      }

      const response = await executeAsSuccess<GetProviderPersonResponse>(
        getPersonQuery,
        {
          organizationSlug: organization.slug,
          personKsuid: toScalarKsuid(person.ksuid),
          providerSlug: provider.slug
        },
        context
      )

      expect(response.providerPerson.person.ksuid).toEqual({
        type: ScalarType.KSUID,
        value: person.ksuid.string
      })
    })
  })
})
