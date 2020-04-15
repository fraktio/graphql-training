import { execute, subscribe } from 'graphql'

import { createApolloServer } from '@src/setup/graphql'
import { createApp } from '@src/setup/express'
import { createServer } from 'http'
import dotenv from 'dotenv'
import { initializeDatabase } from '@src/setup/database'
import { readConfigByApplication } from '@src/config'

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

// for Subscription
const httpServer = createServer(app)
apolloServer.installSubscriptionHandlers(httpServer)

httpServer.listen({ port, hostname: host }, () => {
  console.log(
    ` Server ready at http://${host}:${port}${apolloServer.graphqlPath}, env: ${app.get('env')}`
  )
  console.log(` Subscriptions ready at http://${host}:${port}${apolloServer.subscriptionsPath}`)
})
