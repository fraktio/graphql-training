import { commonResolvers } from './commonResolvers'
import { dateResolvers } from './dateResolvers'
import { personResolvers } from './personResolvers'

export const resolvers = {
  ...commonResolvers,
  ...dateResolvers,
  ...personResolvers
}
