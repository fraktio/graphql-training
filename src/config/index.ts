import { Application } from 'express'
import { DurationInputArg2 } from 'moment'
import fs from 'fs'
import path from 'path'

export interface Config
  extends Readonly<{
    graphql: {
      playground: boolean
      engine: boolean
    }
    cors: {
      accessControlAllowOrigin: string[]
    }
    authentication: {
      session: {
        expirationTime: {
          amount: number
          unit: DurationInputArg2
        }
        refreshTime: {
          amount: number
          unit: DurationInputArg2
        }
      }
    }
    cache: {
      redis: {
        prefix: string
      }
      // Cache times in seconds
      time: {
        accounts: number
      }
    }
  }> {}

export function readConfigByApplication(app: Application): Config {
  return readConfigByEnvironment(app.get('env'))
}

export function readConfigByEnvironment(env: string): Config {
  return JSON.parse(fs.readFileSync(getConfigFileByEnvironment(env)).toString())
}

export function getConfigFileByEnvironment(env: string): string {
  return path.join(__dirname, `./config.${env}.json`)
}
