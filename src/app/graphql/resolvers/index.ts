import mergeAll from 'lodash/fp/mergeAll'

import { addressResolvers } from './addressResolvers'
import { collectiveAgreementResolvers } from './collectiveAgreementResolvers'
import { commonResolvers } from './commonResolvers'
import { dateResolvers } from './dateResolvers'
import { financeResolvers } from './financeResolvers'
import { organizationResolvers } from './organizationResolvers'
import { personResolvers } from './personResolvers'
import { providerResolvers } from './providerResolvers'
import { userResolvers } from './userResolvers'

export const resolvers = mergeAll([
  {},
  addressResolvers,
  collectiveAgreementResolvers,
  commonResolvers,
  dateResolvers,
  financeResolvers,
  organizationResolvers,
  personResolvers,
  providerResolvers,
  userResolvers
])
