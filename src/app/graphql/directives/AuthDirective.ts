import { SchemaDirectiveVisitor } from 'graphql-tools'
import { withAuthenticatedUser } from '@app/graphql/resolvers/util/withAuthenticatedUser'

export class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type)
    type._requiredAuthRole = this.args.requires
  }
  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType)
    field._requiredAuthRole = this.args.requires
  }

  ensureFieldsWrapped(objectType) {
    if (objectType._authFieldsWrapped) {
      return
    }
    objectType._authFieldsWrapped = true

    const fields = objectType.getFields()

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      const { resolve } = field
      field.resolve = async function(...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole = field._requiredAuthRole || objectType._requiredAuthRole

        if (!requiredRole) {
          return resolve.apply(this, args)
        }

        const context = args[2]

        const authenticatedUser = withAuthenticatedUser(
          context,
          authenticatedUser => authenticatedUser
        )

        if (!authenticatedUser.user.accessRights.includes(requiredRole)) {
          throw new Error(
            `User doesn't have required access right: <${requiredRole}> for field: <${fieldName}>`
          )
        }

        return resolve.apply(this, args)
      }
    })
  }
}
