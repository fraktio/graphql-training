export interface ValidationErrors
  extends Readonly<{
    validationErrors: ValidationError[]
    success: false
  }> {}

interface ValidationError
  extends Readonly<{
    message: string
    code: ValidationErrorCode
  }> {}

export enum ValidationErrorCode {
  UNIQUE_CONSTRAINT_VIOLATION = 'UNIQUE_CONSTRAINT_VIOLATION',
  SCALAR_VALIDATION_ERROR = 'SCALAR_VALIDATION_ERROR',
  EMPLOYEE_DOES_NOT_EXIST_IN_COMPANY = 'EMPLOYEE_DOES_NOT_EXIST_IN_COMPANY'
}
