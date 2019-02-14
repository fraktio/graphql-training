import { PoolClient } from 'pg'

export abstract class AbstractLoaderFactory<Loader> {
  private client: PoolClient | null = null
  private loader: Loader | null = null

  public injectClient(client: PoolClient): void {
    this.client = client
  }

  public getLoader(): Loader {
    if (!this.loader) {
      this.loader = this.initialize()
    }

    return this.loader
  }

  protected abstract createLoader(client: PoolClient): Loader

  private initialize(): Loader {
    const client = this.client

    if (!client) {
      throw new Error('Client is not set. You should call injectClient(client) before getLoader()')
    }

    return this.createLoader(client)
  }
}
