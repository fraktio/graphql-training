import { PoolClient } from 'pg'

import { Maybe } from '@app/common/types'

export abstract class AbstractLoaderFactory<Loader> {
  private loader: Maybe<Loader> = null

  public getLoader(client: PoolClient): Loader {
    if (!this.loader) {
      this.loader = this.createLoader(client)
    }

    return this.loader
  }

  protected abstract createLoader(client: PoolClient): Loader
}
