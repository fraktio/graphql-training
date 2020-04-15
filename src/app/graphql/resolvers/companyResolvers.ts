import {
  AddCompanyInput,
  AddPersonToCompanyEmployeeInput,
  CompanyRecord,
  EditCompanyInput,
  RemoveEmployeeFromCompanyInput
} from '@app/company/types'
import { Context, NotFoundError } from '@app/graphql/types'
import { GraphQLError, GraphQLScalarType, ValueNode } from 'graphql'
import { Root, ScalarType } from './types'
import { ValidationErrorCode, ValidationErrors } from '@app/graphql/schema/types'
import {
  addCompany,
  addPersonToCompanyEmployee,
  editCompany,
  getCompanies,
  removeEmployeeFromCompanyEmployee,
  tryGetCompanyByKsuid
} from '@app/company/companyService'
import { parseScalarValue, parseStringScalarLiteral } from './util'
import { tryGetPersonByKsuid, tryGetPersonsByCompanyId } from '@app/person/personService'
import { validateCountryCode, validateEmail, validatePhone } from '@app/validation'

import KSUID from 'ksuid'
import { PersonRecord } from '@app/person/types'
import { hasScalarValidationErrors } from './util/scalarValidationError'
import { transaction } from '@app/util/database'

interface CompanyArgs {
  ksuid: KSUID
}

export interface AddCompanyArgs
  extends Readonly<{
    input: AddCompanyInput
  }> {}

export type AddCompanyOutput = AddCompanySuccess | ValidationErrors

interface AddCompanySuccess
  extends Readonly<{
    company: CompanyRecord
    success: true
  }> {}

export type EditCompanyOutput = EditCompanySuccess | ValidationErrors

interface EditCompanySuccess
  extends Readonly<{
    company: CompanyRecord
    success: true
  }> {}

export interface EditCompanyArgs
  extends Readonly<{
    input: EditCompanyInput
  }> {}

export type AddPersonToCompanyEmployeeOutput = AddPersonToCompanyEmployeeSuccess | ValidationErrors

interface AddPersonToCompanyEmployeeSuccess
  extends Readonly<{
    company: CompanyRecord
    success: true
  }> {}

export interface AddPersonToCompanyEmployeeArgs
  extends Readonly<{
    input: AddPersonToCompanyEmployeeInput
  }> {}

export type RemoveEmployeeFromCompanyOutput = RemoveEmployeeFromCompanySuccess | ValidationErrors

interface RemoveEmployeeFromCompanySuccess
  extends Readonly<{
    company: CompanyRecord
    success: true
  }> {}

export interface RemoveEmployeeFromCompanyArgs
  extends Readonly<{
    input: RemoveEmployeeFromCompanyInput
  }> {}

export const companyResolvers = {
  Query: {
    async companies(
      _: Root,
      args: {},
      { loaderFactories: { companyLoaderFactory } }: Context
    ): Promise<CompanyRecord[]> {
      return transaction(async connection => {
        const { companyLoader } = companyLoaderFactory.getLoaders(connection)

        return getCompanies(companyLoader, connection)
      })
    },
    async company(
      _: Root,
      args: CompanyArgs,
      { loaderFactories: { companyLoaderFactory } }: Context
    ): Promise<CompanyRecord> {
      return transaction(async connection => {
        const { companyByKsuidLoader } = companyLoaderFactory.getLoaders(connection)
        return tryGetCompanyByKsuid(companyByKsuidLoader, args.ksuid)
      })
    }
  },

  Mutation: {
    async addCompany(_: Root, { input }: AddCompanyArgs): Promise<AddCompanyOutput> {
      return transaction(async connection => {
        const result = await addCompany(connection, input)

        if (result.success) {
          return {
            company: result.value,
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

    async editCompany(
      _: Root,
      { input }: EditCompanyArgs,
      { loaderFactories: { companyLoaderFactory } }: Context
    ): Promise<EditCompanyOutput> {
      return transaction(async connection => {
        const { ksuid } = input

        const companyLoaders = companyLoaderFactory.getLoaders(connection)
        const { companyLoader, companyByKsuidLoader } = companyLoaders

        const company = await tryGetCompanyByKsuid(companyByKsuidLoader, ksuid)
        const result = await editCompany(companyLoader, connection, company, input)

        if (result.success) {
          return {
            company: result.value,
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

    async addPersonToCompanyEmployee(
      _: Root,
      { input }: AddPersonToCompanyEmployeeArgs,
      { loaderFactories }: Context
    ): Promise<AddPersonToCompanyEmployeeOutput> {
      return transaction(async connection => {
        const {
          companiesByEmployeeLoader,
          companyByKsuidLoader
        } = loaderFactories.companyLoaderFactory.getLoaders(connection)
        const {
          personByKsuidLoader,
          personsByEmployerLoader
        } = loaderFactories.personLoaderFactory.getLoaders(connection)

        const company = await tryGetCompanyByKsuid(companyByKsuidLoader, input.companyKsuid)
        const person = await tryGetPersonByKsuid(personByKsuidLoader, input.personKsuid)

        const result = await addPersonToCompanyEmployee(
          personsByEmployerLoader,
          companiesByEmployeeLoader,
          connection,
          {
            company,
            person
          }
        )

        if (result.success) {
          return {
            company: company,
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

    async removeEmployeeFromCompany(
      _: Root,
      { input }: RemoveEmployeeFromCompanyArgs,
      { loaderFactories }: Context
    ): Promise<RemoveEmployeeFromCompanyOutput> {
      return transaction(async connection => {
        const {
          companiesByEmployeeLoader,
          companyByKsuidLoader
        } = loaderFactories.companyLoaderFactory.getLoaders(connection)
        const {
          personByKsuidLoader,
          personsByEmployerLoader
        } = loaderFactories.personLoaderFactory.getLoaders(connection)

        const company = await tryGetCompanyByKsuid(companyByKsuidLoader, input.companyKsuid)
        const person = await tryGetPersonByKsuid(personByKsuidLoader, input.personKsuid)

        const result = await removeEmployeeFromCompanyEmployee(
          personsByEmployerLoader,
          companiesByEmployeeLoader,
          connection,
          {
            company,
            person
          }
        )

        if (result.success) {
          return {
            company: company,
            success: true as true
          }
        } else {
          return {
            success: false as false,
            validationErrors: [
              {
                code: ValidationErrorCode.EMPLOYEE_DOES_NOT_EXIST_IN_COMPANY,
                message: result.error.field
              }
            ]
          }
        }
      })
    }
  },

  AddCompanyOutput: {
    __resolveType(addCompanyOutput: AddCompanyOutput): string {
      return addCompanyOutput.success ? 'AddCompanySuccess' : 'ValidationErrors'
    }
  },

  EditCompanyOutput: {
    __resolveType(editCompanyOutput: EditCompanyOutput): string {
      return editCompanyOutput.success ? 'EditCompanySuccess' : 'ValidationErrors'
    }
  },

  AddPersonToCompanyEmployeeOutput: {
    __resolveType(addPersonToCompanyEmployeeOutput: AddPersonToCompanyEmployeeOutput): string {
      return addPersonToCompanyEmployeeOutput.success
        ? 'AddPersonToCompanyEmployeeSuccess'
        : 'ValidationErrors'
    }
  },

  RemoveEmployeeFromCompanyOutput: {
    __resolveType(removeEmployeeFromCompanyOutput: RemoveEmployeeFromCompanyOutput): string {
      console.log(removeEmployeeFromCompanyOutput)
      return removeEmployeeFromCompanyOutput.success
        ? 'RemoveEmployeeFromCompanySuccess'
        : 'ValidationErrors'
    }
  },

  Company: {
    async employees(
      company: CompanyRecord,
      _: {},
      { loaderFactories: { personLoaderFactory } }: Context
    ): Promise<Array<PersonRecord>> {
      return transaction(async connection => {
        const personLoaders = personLoaderFactory.getLoaders(connection)
        const { personsByEmployerLoader } = personLoaders
        return tryGetPersonsByCompanyId(personsByEmployerLoader, company.id)
      })
    }
  }
}
