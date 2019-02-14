import { commonResolvers } from './commonResolvers'
import { dateResolvers } from './dateResolvers'
import { personResolvers } from './personResolvers'

export const resolvers = {
  ...commonResolvers,
  ...dateResolvers,
  ...personResolvers
}

export type Root = typeof undefined

export interface IdArgs {
  id: number
}
