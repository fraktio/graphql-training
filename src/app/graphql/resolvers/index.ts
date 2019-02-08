import { personResolvers } from './personResolvers'
import { scalarResolvers } from './scalarResolvers'

export const resolvers = {
  ...scalarResolvers,
  ...personResolvers
}

export type Root = typeof undefined

export interface IdArgs {
  id: number
}
