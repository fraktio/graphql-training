import { gql } from 'apollo-server-express'

import { CountryCode } from '@app/address/types'
import { Maybe } from '@app/common/types'
import {
  ScalarBIC,
  ScalarCountryCode,
  ScalarEmail,
  ScalarIBAN,
  ScalarKsuid,
  ScalarLanguage,
  ScalarMoney,
  ScalarMunicipality,
  ScalarPersonalIdentityCode,
  ScalarPhone,
  ScalarPostalCode
} from '@app/graphql/resolvers/types'
import { createLoaderFactories } from '@app/loader'
import { Language } from '@app/person/types'
import { transaction } from '@app/util/database'
import {
  asBic,
  asEmail,
  asIban,
  asMoney,
  asMunicipality,
  asPersonalIdentityCode,
  asPhone,
  asPostalCode
} from '@app/validation'
import { anEmployment, aPerson, aProvider } from '@test/test/integration/builder'
import { truncateDatabase } from '@test/util/database'
import { executeAsSuccess } from '@test/util/graphql'
import {
  toScalarBic,
  toScalarCountryCode,
  toScalarEmail,
  toScalarIban,
  toScalarKsuid,
  toScalarLanguage,
  toScalarMoney,
  toScalarMunicipality,
  toScalarPersonalIdentityCode,
  toScalarPhone,
  toScalarPostalCode
} from '@test/util/scalar'
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
    desiredSalary: Maybe<ScalarMoney>
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

describe('provider person edit', () => {
  it('edits a person', async done => {
    asyncTest(done, async () => {
      const [provider, person] = await transaction(async connection => {
        const providerRecord = await aProvider(connection).build()

        const personRecord = await aPerson(connection).build()

        await anEmployment(connection)
          .withProvider(providerRecord)
          .withPerson(personRecord)
          .build()

        return Promise.all([providerRecord, personRecord])
      })

      const input = {
        ksuid: toScalarKsuid(person.ksuid),
        person: {
          address: {
            country: toScalarCountryCode(CountryCode.SE),
            municipality: toScalarMunicipality(asMunicipality('Espoo')),
            postalCode: toScalarPostalCode(asPostalCode('01234')),
            streetAddress: 'Street 123'
          },
          bankAccountIsShared: true,
          bic: toScalarBic(asBic('NDAEFIHH')),
          desiredSalary: toScalarMoney(asMoney(2125)),
          email: toScalarEmail(asEmail('john@smith.com')),
          firstName: 'John',
          iban: toScalarIban(asIban('FI1340220142000625')),
          languages: [Language.EN, Language.SE].map(language => toScalarLanguage(language)),
          lastName: 'Smith',
          limitations: 'Xoo xoo',
          nationality: toScalarCountryCode(CountryCode.FI),
          nickName: 'Bob',
          personalIdentityCode: toScalarPersonalIdentityCode(asPersonalIdentityCode('181193-686L')),
          phone: toScalarPhone(asPhone('+358401234567')),
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
          country: toScalarCountryCode(CountryCode.SE),
          municipality: toScalarMunicipality(asMunicipality('Espoo')),
          postalCode: toScalarPostalCode(asPostalCode('01234')),
          streetAddress: 'Street 123'
        },
        bankAccountIsShared: true,
        bic: toScalarBic(asBic('NDAEFIHH')),
        desiredSalary: toScalarMoney(asMoney(2125)),
        email: toScalarEmail(asEmail('john@smith.com')),
        firstName: 'John',
        iban: toScalarIban(asIban('FI1340220142000625')),
        ksuid: toScalarKsuid(person.ksuid),
        languages: [Language.EN, Language.SE].map(language => toScalarLanguage(language)),
        lastName: 'Smith',
        limitations: 'Xoo xoo',
        nationality: toScalarCountryCode(CountryCode.FI),
        nickName: 'Bob',
        personalIdentityCode: toScalarPersonalIdentityCode(asPersonalIdentityCode('181193-686L')),
        phone: toScalarPhone(asPhone('+358401234567')),
        preferredWorkingAreas: ['Helsinki']
      }

      expect(editPersonResponse.editPerson.person).toEqual(expectedPerson)
    })
  })
})
