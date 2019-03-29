import { gql } from 'apollo-server-express'

import { Country, Email, Municipality, Phone, PostalCode } from '@app/address/types'
import { Maybe } from '@app/common/types'
import { BIC, Currency, IBAN } from '@app/finance/types'
import { KsuidOutput } from '@app/graphql/resolvers/types'
import { createLoaderFactories } from '@app/loader'
import { Language, Nationality, PersonalIdentityCode } from '@app/person/types'
import { transaction } from '@app/util/database'
import { asEmail } from '@app/validation'
import { anEmployment, aPerson, aProvider } from '@test/test/integration/builder'
import { truncateDatabase } from '@test/util/database'
import { executeAsSuccess } from '@test/util/graphql'
import { toScalarKsuid } from '@test/util/scalar'
import { asyncTest } from '@test/util/test'

beforeEach(truncateDatabase)

const editPersonMutation = gql`
  mutation EditPerson($input: EditPersonInput!) {
    editPerson(input: $input) {
      ... on EditPersonSuccess {
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
      }
    }
  }
`

interface EditPersonResponse
  extends Readonly<{
    editPerson: {
      person: Person
    }
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

describe('provider person edit', () => {
  it('edits a person', async done => {
    asyncTest(done, async () => {
      const [provider, person] = await transaction(async client => {
        const providerRecord = await aProvider(client).build()

        const personRecord = await aPerson(client).build()

        await anEmployment(client)
          .withProvider(providerRecord)
          .withPerson(personRecord)
          .build()

        return Promise.all([providerRecord, personRecord])
      })

      const input = {
        ksuid: toScalarKsuid(person.ksuid),
        person: {
          address: {
            country: 'SE',
            municipality: 'Espoo',
            postalCode: '01234',
            streetAddress: 'Street 123'
          },
          bankAccountIsShared: true,
          bic: 'NDAEFIHH',
          desiredSalary: 21.25,
          email: 'john@smith.com',
          firstName: 'John',
          iban: 'FI1340220142000625',
          languages: [Language.EN, Language.SE],
          lastName: 'Smith',
          limitations: 'Xoo xoo',
          nationality: 'FIN',
          nickName: 'Bob',
          personalIdentityCode: '181193-686L',
          phone: '+358401234567',
          preferredWorkingAreas: ['Helsinki']
        },
        providerKsuid: toScalarKsuid(provider.ksuid)
      }

      const context = {
        loaderFactories: createLoaderFactories()
      }

      const editPersonResponse = await executeAsSuccess<EditPersonResponse>(
        editPersonMutation,
        { input },
        context
      )

      const expectedPerson: Person = {
        address: {
          country: 'SE',
          municipality: 'Espoo',
          postalCode: '01234',
          streetAddress: 'Street 123'
        },
        bankAccountIsShared: true,
        bic: 'NDAEFIHH',
        desiredSalary: 21.25,
        email: asEmail('john@smith.com'),
        firstName: 'John',
        iban: 'FI1340220142000625',
        ksuid: toScalarKsuid(person.ksuid),
        languages: [Language.EN, Language.SE],
        lastName: 'Smith',
        limitations: 'Xoo xoo',
        nationality: 'FIN',
        nickName: 'Bob',
        personalIdentityCode: '181193-686L',
        phone: '+358401234567',
        preferredWorkingAreas: ['Helsinki']
      }

      expect(editPersonResponse.editPerson.person).toEqual(expectedPerson)
    })
  })
})
