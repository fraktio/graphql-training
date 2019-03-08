import { FinnishBusinessIds } from 'finnish-business-ids'

import { BusinessID, ID, Slug } from '@app/common/types'
import { ValidationError } from './types'

export function asId(value: number): ID {
  return (value as unknown) as ID
}

export function validateSlug(value: string): Slug | ValidationError {
  if (/^[a-z][a-z\-]+[a-z]$/.test(value)) {
    return (value as unknown) as Slug
  }

  return new ValidationError()
}

export function asSlug(value: string): Slug {
  const slug = validateSlug(value)

  if (slug instanceof ValidationError) {
    throw slug
  }

  return slug
}

export function validateBusinessID(value: string): BusinessID | ValidationError {
  if (FinnishBusinessIds.isValidBusinessId(value)) {
    return (value as unknown) as BusinessID
  }

  return new ValidationError()
}

export function asBusinessID(value: string): BusinessID {
  const businessId = validateBusinessID(value)

  if (businessId instanceof ValidationError) {
    throw businessId
  }

  return businessId
}
