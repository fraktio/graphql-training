import { CustomError } from 'ts-custom-error'
import { ID } from '@app/common/types'
import KSUID from 'ksuid'
import { PersonRecord } from '@app/person/types'
import { Timestamp } from '@app/date/types'

export interface CompanyRecord
  extends Readonly<{
    id: ID
    ksuid: KSUID
    name: string
    timestamp: Timestamp
  }> {}

export interface AddCompanyInput
  extends Readonly<{
    company: CompanyInput
  }> {}

interface CompanyInput
  extends Readonly<{
    name: string
  }> {}

export interface EditCompanyInput
  extends Readonly<{
    ksuid: KSUID
    company: CompanyInput
  }> {}

export interface AddPersonToCompanyEmployeeInput
  extends Readonly<{
    companyKsuid: KSUID
    personKsuid: KSUID
  }> {}

export interface RemoveEmployeeFromCompanyInput
  extends Readonly<{
    companyKsuid: KSUID
    personKsuid: KSUID
  }> {}

export interface AddEmployeeRecordInput
  extends Readonly<{
    person: PersonRecord
    company: CompanyRecord
  }> {}

export interface RemoveEmployeeRecordFromCompanyInput
  extends Readonly<{
    person: PersonRecord
    company: CompanyRecord
  }> {}

export interface CompanyByEmployeeRecord
  extends Readonly<{
    personId: ID
    company: CompanyRecord
  }> {}

export interface EmployeeDoesNotExistInCompanyError
  extends Readonly<{
    personId: ID
    company: CompanyRecord
  }> {}

export class EmployeeDoesNotExistInCompanyError extends CustomError {
  public constructor(public readonly field: string, message?: string) {
    super(message)
  }
}
