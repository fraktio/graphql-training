import { tryGetAddress } from '@app/address/addressService'
import { AddressRecord, Email } from '@app/address/types'
import { getCollectiveAgreement } from '@app/collective-agreement/collectiveAgreementService'
import { Maybe } from '@app/common/types'
import { ValidationErrorCode, ValidationErrors } from '@app/graphql/schema/types'
import { Context, NotFoundError } from '@app/graphql/types'
import { addPerson, getAllPersons, getPerson } from '@app/person/personService'
import { AddPersonInput, PersonRecord } from '@app/person/types'
import { getProvider } from '@app/provider/providerService'
import { tryGetUser } from '@app/user/userService'
import { transaction, UniqueConstraintViolationError } from '@app/util/database'
import { KSUIDArgs, Root } from './types'

export interface AddPersonArgs
  extends Readonly<{
    input: AddPersonInput
  }> {}

export type AddPersonOutput = AddPersonSuccess | ValidationErrors

interface AddPersonSuccess
  extends Readonly<{
    person: PersonRecord
    success: true
  }> {}

export const personResolvers = {
  Person: {
    async email(
      person: PersonRecord,
      _: {},
      { loaderFactories: { userLoaderFactory } }: Context
    ): Promise<Email> {
      return transaction(async client => {
        const user = await tryGetUser(userLoaderFactory.getLoader(client), person.userAccountId)

        return user.email
      })
    },

    async address(
      person: PersonRecord,
      _: {},
      { loaderFactories: { addressLoaderFactory } }: Context
    ): Promise<AddressRecord> {
      return transaction(async client => {
        return tryGetAddress(addressLoaderFactory.getLoader(client), person.addressId)
      })
    }
  },

  AddPersonOutput: {
    __resolveType(addPersonOutput: AddPersonOutput): string {
      return addPersonOutput.success ? 'AddPersonSuccess' : 'ValidationErrors'
    }
  },

  Query: {
    async persons(
      _0: Root,
      _1: {},
      { loaderFactories: { personByKsuidLoaderFactory } }: Context
    ): Promise<PersonRecord[]> {
      return transaction(async client => {
        return getAllPersons(personByKsuidLoaderFactory.getLoader(client), client)
      })
    },

    async person(
      _: Root,
      args: KSUIDArgs,
      { loaderFactories: { personByKsuidLoaderFactory } }: Context
    ): Promise<Maybe<PersonRecord>> {
      return transaction(async client => {
        return getPerson(personByKsuidLoaderFactory.getLoader(client), args.ksuid)
      })
    }
  },

  Mutation: {
    async addPerson(
      _: Root,
      { input }: AddPersonArgs,
      {
        loaderFactories: { providerByKsuidLoaderFactory, collectiveAgreementByKsuidLoaderFactory }
      }: Context
    ): Promise<AddPersonOutput> {
      return transaction(async client => {
        const provider = await getProvider(
          providerByKsuidLoaderFactory.getLoader(client),
          input.providerKsuid
        )

        if (!provider) {
          throw new NotFoundError('Provider was not found')
        }

        const collectiveAgreement = await getCollectiveAgreement(
          collectiveAgreementByKsuidLoaderFactory.getLoader(client),
          input.person.personEmployment.collectiveAgreementKsuid
        )

        if (!collectiveAgreement) {
          throw new NotFoundError('CollectiveAgreement was not found')
        }

        const result = await addPerson(client, input, provider, collectiveAgreement)

        if (result instanceof UniqueConstraintViolationError) {
          return {
            success: false as false,
            validationErrors: [
              {
                code: ValidationErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
                field: result.field
              }
            ]
          }
        } else {
          return {
            person: result,
            success: true as true
          }
        }
      })
    }
  }
}
