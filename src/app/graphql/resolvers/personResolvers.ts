import { tryGetAddress } from '@app/address/addressService'
import { AddressRecord, Email } from '@app/address/types'
import { ValidationErrorCode, ValidationErrors } from '@app/graphql/schema/types'
import { Context } from '@app/graphql/types'
import { addPerson, getAllPersons, getPerson } from '@app/person/personService'
import { AddPersonInput, PersonRecord } from '@app/person/types'
import { tryGetUser } from '@app/user/userService'
import { transaction, UniqueConstraintViolationError } from '@app/util/database'
import { IdArgs, Root } from './types'

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
      { loadersFactories: { userLoaderFactory } }: Context
    ): Promise<Email> {
      return transaction(async client => {
        userLoaderFactory.injectClient(client)

        const user = await tryGetUser(userLoaderFactory.getLoader(), person.userAccountId)

        return user.email
      })
    },

    async address(
      person: PersonRecord,
      _: {},
      { loadersFactories: { addressLoaderFactory } }: Context
    ): Promise<AddressRecord> {
      return transaction(async client => {
        addressLoaderFactory.injectClient(client)

        return tryGetAddress(addressLoaderFactory.getLoader(), person.addressId)
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
      { loadersFactories: { personLoaderFactory } }: Context
    ): Promise<PersonRecord[]> {
      return transaction(async client => {
        personLoaderFactory.injectClient(client)

        return getAllPersons(personLoaderFactory.getLoader(), client)
      })
    },

    async person(
      _: Root,
      args: IdArgs,
      { loadersFactories: { personLoaderFactory } }: Context
    ): Promise<PersonRecord | null> {
      return transaction(async client => {
        personLoaderFactory.injectClient(client)

        return getPerson(personLoaderFactory.getLoader(), args.ksuid)
      })
    }
  },

  Mutation: {
    async addPerson(_: Root, { input }: AddPersonArgs): Promise<AddPersonOutput> {
      return transaction(async client => {
        const result = await addPerson(client, input)

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
