import dotenv from 'dotenv'

import { readConfigByApplication } from '@src/config'
import { initializeDatabase } from '@src/setup/database'
import { createApp } from '@src/setup/express'
import { createApolloEngine, createApolloServer } from '@src/setup/graphql'

dotenv.config()

const app = createApp()

const host = process.env.HOST
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : null
const databaseUrl = process.env.DATABASE_URL

if (port == null) {
  throw new Error('process.env.PORT is not defined!')
}
if (host == null) {
  throw new Error('process.env.HOST is not defined!')
}
if (databaseUrl == null) {
  throw new Error('process.env.DATABASE_URL is not defined!')
}

const config = readConfigByApplication(app)

const apolloServer = createApolloServer(config)

apolloServer.applyMiddleware({ app })

initializeDatabase(databaseUrl)

if (config.graphql.engineProxy) {
  const engineApiKey = process.env.ENGINE_API_KEY

  if (engineApiKey == null) {
    throw new Error('process.env.ENGINE_API_KEY is not defined!')
  }

  const apolloEngine = createApolloEngine(engineApiKey)

  apolloEngine.on('error', (error: Error) => {
    // tslint:disable:no-console
    console.error('There was an error starting the server or Apollo Engine.')
    console.error(error)
    // tslint:enable

    // The app failed to start, we probably want to kill the server
    process.exit(1)
  })

  apolloEngine.listen(
    {
      expressApp: app,
      host,
      port
    },
    () => {
      // tslint:disable-next-line:no-console
      console.log(
        `>>> Apollo Engine Proxy Server listening at http://${host}:${port}, env: ${app.get('env')}`
      )
    }
  )
} else {
  app.listen(port, host, (error: Error) => {
    if (error) {
      // tslint:disable-next-line:no-console
      console.error(error)
    } else {
      // tslint:disable-next-line:no-console
      console.log(`>>> Server listening at http://${host}:${port}, env: ${app.get('env')}`)
    }
  })
}
