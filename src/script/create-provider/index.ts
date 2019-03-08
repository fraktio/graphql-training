import dotenv from 'dotenv'

import { transaction } from '@app/util/database'
import { asSlug } from '@app/validation'
import { run } from '@src/script'
import { initializeDatabase } from '@src/setup/database'
import { anOrganization, aProvider } from '@test/test/integration/builder'

dotenv.config()

run('create-provider', async () => {
  const databaseUrl = process.env.DATABASE_URL

  if (databaseUrl == null) {
    throw new Error('process.env.DATABASE_URL is not defined!')
  }

  initializeDatabase(databaseUrl)

  const [organization, provider] = await transaction(async client => {
    const organizationRecord = await anOrganization(client)
      .withSlug(asSlug('test-organization'))
      .build()

    const providerRecord = await aProvider(client)
      .withOrganization(organizationRecord)
      .withSlug(asSlug('test-provider'))
      .build()

    return Promise.all([organizationRecord, providerRecord])
  })

  // tslint:disable:no-console
  console.log('Created organization:')
  console.log(organization)

  console.log('Created provider:')
  console.log(provider)
  // tslint:enable
})
