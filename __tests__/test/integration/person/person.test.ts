import { gql } from 'apollo-server-express'

import { KsuidOutput, ScalarType } from '@app/graphql/resolvers/types'
import { createLoaderFactories } from '@app/loader'
import { transaction } from '@app/util/database'
import { aPerson } from '@test/test/integration/builder'
import { truncateDatabase } from '@test/util/database'
import { executeAsSuccess } from '@test/util/graphql'
import { asyncTest } from '@test/util/test'

beforeEach(truncateDatabase)

const getPersonQuery = gql`
  query GetPerson($ksuid: KSUID!) {
    person(ksuid: $ksuid) {
      ksuid
    }
  }
`

interface GetPersonResponse
  extends Readonly<{
    person: Person
  }> {}

interface Person
  extends Readonly<{
    ksuid: KsuidOutput
  }> {}

describe('person', () => {
  it('gets a person', async done => {
    asyncTest(done, async () => {
      const person = await transaction(async client => {
        return aPerson(client).build()
      })

      const context = {
        loaderFactories: createLoaderFactories()
      }

      const response = await executeAsSuccess<GetPersonResponse>(
        getPersonQuery,
        { ksuid: { type: ScalarType.KSUID, value: person.ksuid.string } },
        context
      )

      expect(response.person.ksuid).toEqual({ type: ScalarType.KSUID, value: person.ksuid.string })
    })
  })
})
