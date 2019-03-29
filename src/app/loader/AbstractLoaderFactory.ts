import { PoolClient } from 'pg'

import { Maybe } from '@app/common/types'

export abstract class AbstractLoaderFactory<Loaders> {
  private loaders: Maybe<Loaders> = null

  public getLoaders(client: PoolClient): Loaders {
    if (!this.loaders) {
      this.loaders = this.createLoaders(client)
    }

    return this.loaders
  }

  protected abstract createLoaders(client: PoolClient): Loaders
}
