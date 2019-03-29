import { tryGetAddress } from '@app/address/addressService'
import { AddressRecord, Email } from '@app/address/types'
import { getCollectiveAgreement } from '@app/collective-agreement/collectiveAgreementService'
import { ValidationErrorCode, ValidationErrors } from '@app/graphql/schema/types'
import { Context, NotFoundError } from '@app/graphql/types'
import { addPerson, editPerson, tryGetPerson } from '@app/person/personService'
import { AddPersonInput, EditPersonInput, PersonRecord } from '@app/person/types'
import {
  getProviderByKsuid,
  getProviderPersonByProviderKsuidAndPersonKsuid
} from '@app/provider/providerService'
import { tryGetUser } from '@app/user/userService'
import { transaction } from '@app/util/database'
import { Root } from './types'

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

export type EditPersonOutput = EditPersonSuccess | ValidationErrors

interface EditPersonSuccess
  extends Readonly<{
    person: PersonRecord
    success: true
  }> {}

export interface EditPersonArgs
  extends Readonly<{
    input: EditPersonInput
  }> {}

export const personResolvers = {
  Person: {
    async email(
      person: PersonRecord,
      _: {},
      { loaderFactories: { userLoaderFactory } }: Context
    ): Promise<Email> {
      return transaction(async client => {
        const user = await tryGetUser(userLoaderFactory.getLoaders(client), person.userId)

        return user.email
      })
    },

    async address(
      person: PersonRecord,
      _: {},
      { loaderFactories: { addressLoaderFactory } }: Context
    ): Promise<AddressRecord> {
      return transaction(async client => {
        return tryGetAddress(addressLoaderFactory.getLoaders(client), person.addressId)
      })
    }
  },

  AddPersonOutput: {
    __resolveType(addPersonOutput: AddPersonOutput): string {
      return addPersonOutput.success ? 'AddPersonSuccess' : 'ValidationErrors'
    }
  },

  EditPersonOutput: {
    __resolveType(editPersonOutput: EditPersonOutput): string {
      return editPersonOutput.success ? 'EditPersonSuccess' : 'ValidationErrors'
    }
  },

  Mutation: {
    async addPerson(
      _: Root,
      { input }: AddPersonArgs,
      { loaderFactories: { providerLoaderFactory, collectiveAgreementLoaderFactory } }: Context
    ): Promise<AddPersonOutput> {
      return transaction(async client => {
        const {
          providerKsuid,
          personEmployment: { collectiveAgreementKsuid }
        } = input

        const provider = await getProviderByKsuid(
          providerLoaderFactory.getLoaders(client).providerByKsuidLoader,
          providerKsuid
        )

        if (!provider) {
          throw new NotFoundError('Provider was not found')
        }

        const collectiveAgreement = await getCollectiveAgreement(
          collectiveAgreementLoaderFactory.getLoaders(client),
          collectiveAgreementKsuid
        )

        if (!collectiveAgreement) {
          throw new NotFoundError('CollectiveAgreement was not found')
        }

        const result = await addPerson(client, input, provider, collectiveAgreement)

        if (result.success) {
          return {
            person: result.value,
            success: true as true
          }
        } else {
          return {
            success: false as false,
            validationErrors: [
              {
                code: ValidationErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
                field: result.error.field
              }
            ]
          }
        }
      })
    },

    async editPerson(
      _: Root,
      { input }: EditPersonArgs,
      { loaderFactories: { personLoaderFactory, addressLoaderFactory, userLoaderFactory } }: Context
    ): Promise<EditPersonOutput> {
      return transaction(async client => {
        const { ksuid, providerKsuid } = input

        const providerPerson = await getProviderPersonByProviderKsuidAndPersonKsuid(
          client,
          providerKsuid,
          ksuid
        )

        if (!providerPerson) {
          throw new NotFoundError('ProviderPerson was not found')
        }

        const personLoader = personLoaderFactory.getLoaders(client)

        const person = await tryGetPerson(personLoader, providerPerson.personId)

        const result = await editPerson(
          personLoader,
          addressLoaderFactory.getLoaders(client),
          userLoaderFactory.getLoaders(client),
          client,
          person,
          input
        )

        if (result.success) {
          return {
            person: result.value,
            success: true as true
          }
        } else {
          return {
            success: false as false,
            validationErrors: [
              {
                code: ValidationErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
                field: result.error.field
              }
            ]
          }
        }
      })
    }
  }
}
