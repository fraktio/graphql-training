import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import express, { Application } from 'express'

import { readConfigByApplication } from '@src/config'

export function createApp(): Application {
  const app = express()

  const origin = readConfigByApplication(app).cors.accessControlAllowOrigin.map(
    allowOrigin => new RegExp(allowOrigin)
  )

  app.use(compression())

  app.use(
    cors({
      allowedHeaders: ['Authorization', 'Content-Type', 'Credentials'],
      credentials: true,
      exposedHeaders: ['Content-Disposition'],
      origin
    })
  )

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  return app
}
