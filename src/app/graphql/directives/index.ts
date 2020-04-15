import { AuthDirective } from '@app/graphql/directives/AuthDirective'
import { UpperCaseDirective } from '@app/graphql/directives/UpperCaseDirective'

export const schemaDirectives = {
  auth: AuthDirective,
  authorized: AuthDirective,
  authenticated: AuthDirective,
  upper: UpperCaseDirective
}
