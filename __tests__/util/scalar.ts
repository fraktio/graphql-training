import KSUID from 'ksuid'

import { BusinessID, Slug } from '@app/common/types'
import { ScalarKsuid, ScalarSlug, ScalarType } from '@app/graphql/resolvers/types'

export function toScalarKsuid(ksuid: KSUID): ScalarKsuid {
  return {
    type: ScalarType.KSUID,
    value: ksuid.string
  }
}

export function toScalarSlug(slug: Slug): ScalarSlug {
  return {
    type: ScalarType.SLUG,
    value: slug.toString()
  }
}
