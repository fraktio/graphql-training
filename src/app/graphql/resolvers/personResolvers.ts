import { GraphQLError, GraphQLScalarType, ValueNode } from 'graphql'

import { tryGetAddress } from '@app/address/addressService'
import { AddressRecord, Email } from '@app/address/types'
import { getCollectiveAgreement } from '@app/collective-agreement/collectiveAgreementService'
import { ValidationErrorCode, ValidationErrors } from '@app/graphql/schema/types'
import { Context, NotFoundError } from '@app/graphql/types'
import { addPerson, editPerson, tryGetPerson } from '@app/person/personService'
import {
  AddPersonInput,
  EditPersonInput,
  Language,
  PersonalIdentityCode,
  PersonRecord
} from '@app/person/types'
import {
  getProviderByKsuid,
  getProviderPersonByProviderKsuidAndPersonKsuid
} from '@app/provider/providerService'
import { tryGetUser } from '@app/user/userService'
import { transaction } from '@app/util/database'
import { validateLanguage, validatePersonalIdentityCode } from '@app/validation'
import { Root, ScalarLanguage, ScalarPersonalIdentityCode, ScalarType } from './types'
import { parseScalarValue, parseStringScalarLiteral } from './util'

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
  PersonalIdentityCode: new GraphQLScalarType({
    description: 'PersonalIdentityCode custom scalar type',
    name: 'PersonalIdentityCode',

    serialize(value: PersonalIdentityCode): ScalarPersonalIdentityCode {
      return {
        type: ScalarType.PERSONAL_IDENTITY_CODE,
        value: value.toString()
      }
    },

    parseValue(value: any): PersonalIdentityCode {
      const scalarValue = parseScalarValue<string>(value, ScalarType.PERSONAL_IDENTITY_CODE)

      const result = validatePersonalIdentityCode(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('PersonalIdentityCode must be a valid personal identity code')
      }
    },

    parseLiteral(ast: ValueNode): PersonalIdentityCode {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.PERSONAL_IDENTITY_CODE)

      const result = validatePersonalIdentityCode(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('PersonalIdentityCode must be a valid personal identity code')
      }
    }
  }),

  Language: new GraphQLScalarType({
    description: 'Language custom scalar type',
    name: 'Language',

    serialize(value: Language): ScalarLanguage {
      return {
        type: ScalarType.LANGUAGE,
        value: value.toString()
      }
    },

    parseValue(value: any): Language {
      const scalarValue = parseScalarValue<string>(value, ScalarType.LANGUAGE)

      const result = validateLanguage(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Language must be a valid language')
      }
    },

    parseLiteral(ast: ValueNode): Language {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.LANGUAGE)

      const result = validateLanguage(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Language must be a valid language')
      }
    }
  }),

  Person: {
    async email(
      person: PersonRecord,
      _: {},
      { loaderFactories: { userLoaderFactory } }: Context
    ): Promise<Email> {
      return transaction(async connection => {
        const user = await tryGetUser(userLoaderFactory.getLoaders(connection), person.userId)

        return user.email
      })
    },

    async address(
      person: PersonRecord,
      _: {},
      { loaderFactories: { addressLoaderFactory } }: Context
    ): Promise<AddressRecord> {
      return transaction(async connection => {
        return tryGetAddress(addressLoaderFactory.getLoaders(connection), person.addressId)
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
      return transaction(async connection => {
        const {
          providerKsuid,
          personEmployment: { collectiveAgreementKsuid }
        } = input

        const provider = await getProviderByKsuid(
          providerLoaderFactory.getLoaders(connection).providerByKsuidLoader,
          providerKsuid
        )

        if (!provider) {
          throw new NotFoundError('Provider was not found')
        }

        const collectiveAgreement = await getCollectiveAgreement(
          collectiveAgreementLoaderFactory.getLoaders(connection),
          collectiveAgreementKsuid
        )

        if (!collectiveAgreement) {
          throw new NotFoundError('CollectiveAgreement was not found')
        }

        const result = await addPerson(connection, input, provider, collectiveAgreement)

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
      return transaction(async connection => {
        const { ksuid, providerKsuid } = input

        const providerPerson = await getProviderPersonByProviderKsuidAndPersonKsuid(
          connection,
          providerKsuid,
          ksuid
        )

        if (!providerPerson) {
          throw new NotFoundError('ProviderPerson was not found')
        }

        const personLoader = personLoaderFactory.getLoaders(connection)

        const person = await tryGetPerson(personLoader, providerPerson.personId)

        const result = await editPerson(
          personLoader,
          addressLoaderFactory.getLoaders(connection),
          userLoaderFactory.getLoaders(connection),
          connection,
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
