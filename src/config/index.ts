import { Application } from 'express'
import fs from 'fs'
import path from 'path'

export interface Config
  extends Readonly<{
    graphql: {
      playground: boolean
      engineProxy: boolean
    }
    cors: {
      accessControlAllowOrigin: string[]
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
