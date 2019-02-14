export interface ValidationErrors
  extends Readonly<{
    validationErrors: ValidationError[]
    success: false
  }> {}

interface ValidationError
  extends Readonly<{
    field: string
    code: ValidationErrorCode
  }> {}

export enum ValidationErrorCode {
  UNIQUE_CONSTRAINT_VIOLATION = 'UNIQUE_CONSTRAINT_VIOLATION'
}
