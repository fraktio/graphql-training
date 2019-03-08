import { gql } from 'apollo-server-express'

import { Country, Email, Municipality, Phone, PostalCode } from '@app/address/types'
import { Maybe } from '@app/common/types'
import { Hour } from '@app/date/types'
import { EmploymentType } from '@app/employment/types'
import { BIC, Currency, IBAN } from '@app/finance/types'
import { KsuidOutput, ScalarType } from '@app/graphql/resolvers/types'
import { createLoaderFactories } from '@app/loader'
import { Language, Nationality, PersonalIdentityCode } from '@app/person/types'
import { transaction } from '@app/util/database'
import {
  aCollectiveAgreement,
  anEmployment,
  anOrganization,
  aPerson,
  aProvider
} from '@test/test/integration/builder'
import { truncateDatabase } from '@test/util/database'
import { executeAsSuccess } from '@test/util/graphql'
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
        ksuid: KsuidOutput
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
    ksuid: KsuidOutput
    firstName: string
    lastName: string
    nickName: Maybe<string>
    personalIdentityCode: PersonalIdentityCode
    email: Email
    phone: Maybe<Phone>
    nationality: Nationality
    preferredWorkingAreas: string[]
    bankAccountIsShared: boolean
    bic: Maybe<BIC>
    iban: Maybe<IBAN>
    address: Address
    desiredSalary: Maybe<Currency>
    languages: Language[]
    limitations: Maybe<string>
  }> {}

interface Address
  extends Readonly<{
    streetAddress: string
    postalCode: PostalCode
    municipality: Municipality
    country: Country
  }> {}

interface Employment
  extends Readonly<{
    ksuid: KsuidOutput
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

describe('provider person', () => {
  it('adds a person and gets it from provider', async done => {
    asyncTest(done, async () => {
      const [organization, provider, collectiveAgreement] = await transaction(async client => {
        const organizationRecord = await anOrganization(client).build()

        const providerRecord = await aProvider(client)
          .withOrganization(organizationRecord)
          .build()

        const collectiveAgreementRecord = await aCollectiveAgreement(client).build()

        return Promise.all([organizationRecord, providerRecord, collectiveAgreementRecord])
      })

      const input = {
        person: {
          address: {
            country: 'FI',
            municipality: 'Helsinki',
            postalCode: '01234',
            streetAddress: 'Street'
          },
          bankAccountIsShared: false,
          bic: null,
          desiredSalary: null,
          email: 'foo@bar.com',
          firstName: 'First',
          iban: null,
          languages: [],
          lastName: 'Last',
          limitations: null,
          nationality: 'FIN',
          nickName: null,
          personEmployment: {
            collectiveAgreementKsuid: {
              type: ScalarType.KSUID,
              value: collectiveAgreement.ksuid.string
            },
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
          personalIdentityCode: '181193-686L',
          phone: '+358401234567',
          preferredWorkingAreas: []
        },
        providerKsuid: {
          type: ScalarType.KSUID,
          value: provider.ksuid.string
        }
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
        { organizationSlug: organization.slug, providerSlug: provider.slug },
        context
      )

      const { providerPersons } = getProviderResponse.provider

      expect(providerPersons).toHaveLength(1)

      const [providerPerson] = providerPersons

      const expectedPerson: Person = {
        address: {
          country: 'FI',
          municipality: 'Helsinki',
          postalCode: '01234',
          streetAddress: 'Street'
        },
        bankAccountIsShared: false,
        bic: null,
        desiredSalary: null,
        email: 'foo@bar.com',
        firstName: 'First',
        iban: null,
        ksuid: addPersonResponse.addPerson.person.ksuid,
        languages: [],
        lastName: 'Last',
        limitations: null,
        nationality: 'FIN',
        nickName: null,
        personalIdentityCode: '181193-686L',
        phone: '+358401234567',
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
      const [organization, provider] = await transaction(async client => {
        const organizationRecord = await anOrganization(client).build()

        const providerRecord = await aProvider(client)
          .withOrganization(organizationRecord)
          .build()

        const personRecord = await aPerson(client).build()

        const collectiveAgreementRecord = await aCollectiveAgreement(client).build()

        const employmentBuilder = anEmployment(client)
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
        { organizationSlug: organization.slug, providerSlug: provider.slug },
        context
      )

      const { providerPersons } = getProviderResponse.provider

      expect(providerPersons).toHaveLength(1)

      const [providerPerson] = providerPersons

      expect(providerPerson.employments).toHaveLength(2)
    })
  })
})
