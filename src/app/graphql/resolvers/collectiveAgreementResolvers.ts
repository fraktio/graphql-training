import { getAllCollectiveAgreements } from '@app/collective-agreement/collectiveAgreementService'
import { CollectiveAgreementRecord } from '@app/collective-agreement/types'
import { Context } from '@app/graphql/types'
import { transaction } from '@app/util/database'
import { Root } from './types'

export const collectiveAgreementResolvers = {
  Query: {
    async collectiveAgreements(
      _0: Root,
      _1: {},
      { loaderFactories: { collectiveAgreementLoaderFactory } }: Context
    ): Promise<CollectiveAgreementRecord[]> {
      return transaction(async connection => {
        return getAllCollectiveAgreements(
          collectiveAgreementLoaderFactory.getLoaders(connection),
          connection
        )
      })
    }
  }
}
