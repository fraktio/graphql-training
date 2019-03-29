import KSUID from 'ksuid'

import { ScalarType } from '@app/graphql/resolvers/types'

export interface ScalarKsuid {
  type: ScalarType.KSUID
  value: string
}

export function toScalarKsuid(ksuid: KSUID): ScalarKsuid {
  return {
    type: ScalarType.KSUID,
    value: ksuid.string
  }
}
