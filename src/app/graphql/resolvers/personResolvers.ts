import { AddPersonInput, EditPersonInput, PersonRecord } from '@app/person/types'
import { Context, NotFoundError } from '@app/graphql/types'
import { Email, PersonalIdentityCode, Phone } from '@app/common/types'
import { GraphQLError, GraphQLScalarType, ValueNode } from 'graphql'
import { Root, ScalarEmail, ScalarPersonalIdentityCode, ScalarPhone, ScalarType } from './types'
import { ValidationErrorCode, ValidationErrors } from '@app/graphql/schema/types'
import { addPerson, editPerson, getPersons, tryGetPersonByKsuid } from '@app/person/personService'
import { parseScalarValue, parseStringScalarLiteral } from './util'
import { validateCountryCode, validateEmail, validatePhone } from '@app/validation'

import KSUID from 'ksuid'
import { hasScalarValidationErrors } from './util/scalarValidationError'
import { transaction } from '@app/util/database'
import { tryGetCompaniesByPersonId } from '@app/company/companyService'
import { validatePersonalIdentityCode } from '@app/validation'

interface PersonArgs {
  ksuid: KSUID
}

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

  Phone: new GraphQLScalarType({
    description: 'Phone custom scalar type',
    name: 'Phone',

    serialize(value: Phone): ScalarPhone {
      return {
        type: ScalarType.PHONE,
        value: value.toString()
      }
    },

    parseValue(value: any): Phone {
      const scalarValue = parseScalarValue<string>(value, ScalarType.PHONE)

      const result = validatePhone(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError(
          ' Phone must be a valid a valid phone number in international format'
        )
      }
    },

    parseLiteral(ast: ValueNode): Phone {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.PHONE)

      const result = validatePhone(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError(
          ' Phone must be a valid a valid phone number in international format'
        )
      }
    }
  }),

  Email: new GraphQLScalarType({
    description: 'Email custom scalar type',
    name: 'Email',

    serialize(value: Email): ScalarEmail {
      return {
        type: ScalarType.EMAIL,
        value: value.toString()
      }
    },

    parseValue(value: any): Email {
      const scalarValue = parseScalarValue<string>(value, ScalarType.EMAIL)

      const result = validateEmail(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Email must be a valid a valid emai address')
      }
    },

    parseLiteral(ast: ValueNode): Email {
      const scalarValue = parseStringScalarLiteral(ast, ScalarType.EMAIL)

      const result = validateEmail(scalarValue)

      if (result.success) {
        return result.value
      } else {
        throw new GraphQLError('Email must be a valid a valid emai address')
      }
    }
  }),

  Query: {
    async persons(
      _: Root,
      args: {},
      { loaderFactories: { personLoaderFactory } }: Context
    ): Promise<PersonRecord[]> {
      return transaction(async connection => {
        const { personLoader } = personLoaderFactory.getLoaders(connection)

        return getPersons(personLoader, connection)
      })
    },
    async person(
      _: Root,
      args: PersonArgs,
      { loaderFactories: { personLoaderFactory } }: Context
    ): Promise<PersonRecord> {
      return transaction(async connection => {
        const { personByKsuidLoader } = personLoaderFactory.getLoaders(connection)
        return tryGetPersonByKsuid(personByKsuidLoader, args.ksuid)
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
    async addPerson(_: Root, { input }: AddPersonArgs): Promise<AddPersonOutput> {
      // output testing...
      const test = hasScalarValidationErrors(input)

      if (test) {
        return {
          success: false as false,
          validationErrors: [
            {
              code: ValidationErrorCode.SCALAR_VALIDATION_ERROR,
              message: 'testing...  '
            }
          ]
        }
      }

      return transaction(async connection => {
        const result = await addPerson(connection, input)

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
                message: result.error.field
              }
            ]
          }
        }
      })
    },

    async editPerson(
      _: Root,
      { input }: EditPersonArgs,
      { loaderFactories: { personLoaderFactory } }: Context
    ): Promise<EditPersonOutput> {
      return transaction(async connection => {
        const { ksuid } = input

        const personLoaders = personLoaderFactory.getLoaders(connection)

        const { personLoader, personByKsuidLoader } = personLoaders

        const person = await tryGetPersonByKsuid(personByKsuidLoader, ksuid)

        const result = await editPerson(personLoader, connection, person, input)

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
                message: result.error.field
              }
            ]
          }
        }
      })
    }
  },

  Person: {
    async employers(
      person: PersonRecord,
      _: {},
      { loaderFactories: { companyLoaderFactory } }: Context
    ): Promise<Array<PersonRecord>> {
      return transaction(async connection => {
        const companyLoaders = companyLoaderFactory.getLoaders(connection)
        const { companiesByEmployeeLoader } = companyLoaders
        return tryGetCompaniesByPersonId(companiesByEmployeeLoader, person.id)
      })
    }
  }
}
