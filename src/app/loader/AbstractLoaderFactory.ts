import { Maybe } from '@app/common/types'
import { PoolConnection } from '@app/util/database/types'

export abstract class AbstractLoaderFactory<Loaders> {
  private loaders: Maybe<Loaders> = null

  public getLoaders(connection: PoolConnection): Loaders {
    if (!this.loaders) {
      this.loaders = this.createLoaders(connection)
    }

    return this.loaders
  }

  protected abstract createLoaders(connection: PoolConnection): Loaders
}
