import mergeAll from 'lodash/fp/mergeAll'

import { collectiveAgreementResolvers } from './collectiveAgreementResolvers'
import { commonResolvers } from './commonResolvers'
import { dateResolvers } from './dateResolvers'
import { organizationResolvers } from './organizationResolvers'
import { personResolvers } from './personResolvers'
import { providerResolvers } from './providerResolvers'

export const resolvers = mergeAll([
  {},
  collectiveAgreementResolvers,
  commonResolvers,
  dateResolvers,
  organizationResolvers,
  personResolvers,
  providerResolvers
])
