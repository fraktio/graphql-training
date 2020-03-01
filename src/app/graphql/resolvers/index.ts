import { commonResolvers } from './commonResolvers'
import { companyResolvers } from './companyResolvers'
import { dateResolvers } from './dateResolvers'
import mergeAll from 'lodash/fp/mergeAll'
import { personResolvers } from './personResolvers'

export const resolvers = mergeAll([
  {},
  commonResolvers,
  companyResolvers,
  dateResolvers,
  personResolvers
])
