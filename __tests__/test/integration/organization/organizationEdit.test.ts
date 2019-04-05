import { gql } from 'apollo-server-express'

import { CountryCode } from '@app/address/types'
import {
  ScalarBusinessID,
  ScalarCountryCode,
  ScalarKsuid,
  ScalarMunicipality,
  ScalarPostalCode,
  ScalarSlug
} from '@app/graphql/resolvers/types'
import { createLoaderFactories } from '@app/loader'
import { transaction } from '@app/util/database'
import { asBusinessId, asMunicipality, asPostalCode, asSlug } from '@app/validation'
import { anOrganization } from '@test/test/integration/builder'
import { truncateDatabase } from '@test/util/database'
import { executeAsSuccess } from '@test/util/graphql'
import {
  toScalarBusinessId,
  toScalarCountryCode,
  toScalarKsuid,
  toScalarMunicipality,
  toScalarPostalCode,
  toScalarSlug
} from '@test/util/scalar'
import { asyncTest } from '@test/util/test'

beforeEach(truncateDatabase)

const editOrganizationMutation = gql`
  mutation EditOrganization($input: EditOrganizationInput!) {
    editOrganization(input: $input) {
      ... on EditOrganizationSuccess {
        organization {
          ksuid
          businessId
          name
          slug

          address {
            streetAddress
            postalCode
            municipality
            country
          }
        }
      }
    }
  }
`

interface EditOrganizationResponse
  extends Readonly<{
    editOrganization: {
      organization: Organization
    }
  }> {}

interface Organization
  extends Readonly<{
    ksuid: ScalarKsuid
    businessId: ScalarBusinessID
    name: string
    slug: ScalarSlug
    address: Address
  }> {}

interface Address
  extends Readonly<{
    streetAddress: string
    postalCode: ScalarPostalCode
    municipality: ScalarMunicipality
    country: ScalarCountryCode
  }> {}

describe('organization edit', () => {
  it('edits an organization', async done => {
    asyncTest(done, async () => {
      const organization = await transaction(async client => {
        return anOrganization(client).build()
      })

      const input = {
        ksuid: toScalarKsuid(organization.ksuid),
        organization: {
          address: {
            country: toScalarCountryCode(CountryCode.SE),
            municipality: toScalarMunicipality(asMunicipality('Espoo')),
            postalCode: toScalarPostalCode(asPostalCode('01234')),
            streetAddress: 'Edited street 123'
          },
          businessId: toScalarBusinessId(asBusinessId('1415386-8')),
          name: 'Edited name',
          slug: toScalarSlug(asSlug('edited-slug'))
        }
      }

      const context = {
        loaderFactories: createLoaderFactories()
      }

      const editOrganizationResponse = await executeAsSuccess<EditOrganizationResponse>(
        editOrganizationMutation,
        { input },
        context
      )

      const expectedOrganization: Organization = {
        address: {
          country: toScalarCountryCode(CountryCode.SE),
          municipality: toScalarMunicipality(asMunicipality('Espoo')),
          postalCode: toScalarPostalCode(asPostalCode('01234')),
          streetAddress: 'Edited street 123'
        },
        businessId: toScalarBusinessId(asBusinessId('1415386-8')),
        ksuid: toScalarKsuid(organization.ksuid),
        name: 'Edited name',
        slug: toScalarSlug(asSlug('edited-slug'))
      }

      expect(editOrganizationResponse.editOrganization.organization).toEqual(expectedOrganization)
    })
  })
})
