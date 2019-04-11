import { gql } from 'apollo-server-express'

import { CountryCode } from '@app/address/types'
import { Maybe } from '@app/common/types'
import { Hour } from '@app/date/types'
import { EmploymentType } from '@app/employment/types'
import { Money } from '@app/finance/types'
import {
  ScalarBIC,
  ScalarCountryCode,
  ScalarEmail,
  ScalarIBAN,
  ScalarKsuid,
  ScalarLanguage,
  ScalarMunicipality,
  ScalarPersonalIdentityCode,
  ScalarPhone,
  ScalarPostalCode
} from '@app/graphql/resolvers/types'
import { createLoaderFactories } from '@app/loader'
import { transaction } from '@app/util/database'
import {
  asEmail,
  asMunicipality,
  asPersonalIdentityCode,
  asPhone,
  asPostalCode
} from '@app/validation'
import {
  aCollectiveAgreement,
  anEmployment,
  anOrganization,
  aPerson,
  aProvider
} from '@test/test/integration/builder'
import { truncateDatabase } from '@test/util/database'
import { executeAsSuccess } from '@test/util/graphql'
import {
  toScalarCountryCode,
  toScalarEmail,
  toScalarKsuid,
  toScalarMunicipality,
  toScalarPersonalIdentityCode,
  toScalarPhone,
  toScalarPostalCode,
  toScalarSlug
} from '@test/util/scalar'
import { asyncTest } from '@test/util/test'

beforeEach(truncateDatabase)

const addPersonMutation = gql`
  mutation AddPerson($input: AddPersonInput!) {
    addPerson(input: $input) {
      ... on AddPersonSuccess {
        person {
          ksuid
        }
      }
    }
  }
`

interface AddPersonResponse
  extends Readonly<{
    addPerson: {
      person: {
        ksuid: ScalarKsuid
      }
    }
  }> {}

const getProviderQuery = gql`
  query GetProvider($organizationSlug: Slug!, $providerSlug: Slug!) {
    provider(organizationSlug: $organizationSlug, providerSlug: $providerSlug) {
      ksuid
      providerPersons {
        person {
          ksuid
          firstName
          lastName
          nickName
          personalIdentityCode
          email
          phone
          nationality
          preferredWorkingAreas
          bankAccountIsShared
          bic
          iban
          desiredSalary
          languages
          limitations
          address {
            streetAddress
            postalCode
            municipality
            country
          }
        }
        employments {
          ksuid
          type
          startDate
          endDate
          averageHours
          description
        }
      }
    }
  }
`

interface GetProviderResponse
  extends Readonly<{
    provider: {
      providerPersons: ProviderPerson[]
    }
  }> {}

interface ProviderPerson
  extends Readonly<{
    person: Person
    employments: Employment[]
  }> {}

interface Person
  extends Readonly<{
    ksuid: ScalarKsuid
    firstName: string
    lastName: string
    nickName: Maybe<string>
    personalIdentityCode: ScalarPersonalIdentityCode
    email: ScalarEmail
    phone: Maybe<ScalarPhone>
    nationality: ScalarCountryCode
    preferredWorkingAreas: string[]
    bankAccountIsShared: boolean
    bic: Maybe<ScalarBIC>
    iban: Maybe<ScalarIBAN>
    address: Address
    desiredSalary: Maybe<Money>
    languages: ScalarLanguage[]
    limitations: Maybe<string>
  }> {}

interface Address
  extends Readonly<{
    streetAddress: string
    postalCode: ScalarPostalCode
    municipality: ScalarMunicipality
    country: ScalarCountryCode
  }> {}

interface Employment
  extends Readonly<{
    ksuid: ScalarKsuid
    type: EmploymentType
    startDate: Maybe<{
      type: 'DATE'
      value: string
    }>
    endDate: Maybe<{
      type: 'DATE'
      value: string
    }>
    averageHours: Maybe<Hour>
    description: Maybe<string>
  }> {}

describe('provider person add', () => {
  it('adds a person and gets it from provider', async done => {
    asyncTest(done, async () => {
      const [organization, provider, collectiveAgreement] = await transaction(async connection => {
        const organizationRecord = await anOrganization(connection).build()

        const providerRecord = await aProvider(connection)
          .withOrganization(organizationRecord)
          .build()

        const collectiveAgreementRecord = await aCollectiveAgreement(connection).build()

        return Promise.all([organizationRecord, providerRecord, collectiveAgreementRecord])
      })

      const input = {
        person: {
          address: {
            country: toScalarCountryCode(CountryCode.FI),
            municipality: toScalarMunicipality(asMunicipality('Helsinki')),
            postalCode: toScalarPostalCode(asPostalCode('01234')),
            streetAddress: 'Street'
          },
          bankAccountIsShared: false,
          bic: null,
          desiredSalary: null,
          email: toScalarEmail(asEmail('foo@bar.com')),
          firstName: 'First',
          iban: null,
          languages: [],
          lastName: 'Last',
          limitations: null,
          nationality: toScalarCountryCode(CountryCode.FI),
          nickName: null,
          personalIdentityCode: toScalarPersonalIdentityCode(asPersonalIdentityCode('181193-686L')),
          phone: toScalarPhone(asPhone('+358401234567')),
          preferredWorkingAreas: []
        },
        personEmployment: {
          collectiveAgreementKsuid: toScalarKsuid(collectiveAgreement.ksuid),
          employment: {
            endDate: {
              type: 'DATE',
              value: '2019-03-01'
            },
            startDate: {
              type: 'DATE',
              value: '2019-01-01'
            },
            type: EmploymentType.INDEFINITE_PART_TIME
          }
        },
        providerKsuid: toScalarKsuid(provider.ksuid)
      }

      const context = {
        loaderFactories: createLoaderFactories()
      }

      const addPersonResponse = await executeAsSuccess<AddPersonResponse>(
        addPersonMutation,
        { input },
        context
      )

      const getProviderResponse = await executeAsSuccess<GetProviderResponse>(
        getProviderQuery,
        {
          organizationSlug: toScalarSlug(organization.slug),
          providerSlug: toScalarSlug(provider.slug)
        },
        context
      )

      const { providerPersons } = getProviderResponse.provider

      expect(providerPersons).toHaveLength(1)

      const [providerPerson] = providerPersons

      const expectedPerson: Person = {
        address: {
          country: toScalarCountryCode(CountryCode.FI),
          municipality: toScalarMunicipality(asMunicipality('Helsinki')),
          postalCode: toScalarPostalCode(asPostalCode('01234')),
          streetAddress: 'Street'
        },
        bankAccountIsShared: false,
        bic: null,
        desiredSalary: null,
        email: toScalarEmail(asEmail('foo@bar.com')),
        firstName: 'First',
        iban: null,
        ksuid: addPersonResponse.addPerson.person.ksuid,
        languages: [],
        lastName: 'Last',
        limitations: null,
        nationality: toScalarCountryCode(CountryCode.FI),
        nickName: null,
        personalIdentityCode: toScalarPersonalIdentityCode(asPersonalIdentityCode('181193-686L')),
        phone: toScalarPhone(asPhone('+358401234567')),
        preferredWorkingAreas: []
      }

      expect(providerPerson.person).toEqual(expectedPerson)

      expect(providerPerson.employments).toHaveLength(1)

      const [employment] = providerPerson.employments

      expect(employment).toEqual({
        averageHours: null,
        description: null,
        endDate: {
          type: 'DATE',
          value: '2019-03-01'
        },
        ksuid: employment.ksuid,
        startDate: {
          type: 'DATE',
          value: '2019-01-01'
        },
        type: EmploymentType.INDEFINITE_PART_TIME
      })
    })
  })

  it('does not duplicate persons with multiple employments', async done => {
    asyncTest(done, async () => {
      const [organization, provider] = await transaction(async connection => {
        const organizationRecord = await anOrganization(connection).build()

        const providerRecord = await aProvider(connection)
          .withOrganization(organizationRecord)
          .build()

        const personRecord = await aPerson(connection).build()

        const collectiveAgreementRecord = await aCollectiveAgreement(connection).build()

        const employmentBuilder = anEmployment(connection)
          .withProvider(providerRecord)
          .withPerson(personRecord)
          .withCollectiveAgreement(collectiveAgreementRecord)

        await employmentBuilder.build()
        await employmentBuilder.build()

        return Promise.all([organizationRecord, providerRecord])
      })

      const context = {
        loaderFactories: createLoaderFactories()
      }

      const getProviderResponse = await executeAsSuccess<GetProviderResponse>(
        getProviderQuery,
        {
          organizationSlug: toScalarSlug(organization.slug),
          providerSlug: toScalarSlug(provider.slug)
        },
        context
      )

      const { providerPersons } = getProviderResponse.provider

      expect(providerPersons).toHaveLength(1)

      const [providerPerson] = providerPersons

      expect(providerPerson.employments).toHaveLength(2)
    })
  })
})
