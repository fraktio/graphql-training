import { PersonRecord } from '@app/person'
import { getPerson } from '@src/app/person/personRepository'
import { transaction } from '@src/util/database'
import { IdArgs, Root } from '.'

export const personResolvers = {
  Query: {
    person(_: Root, args: IdArgs): Promise<PersonRecord | null> {
      return transaction(async client => {
        return getPerson(client, args.id)
      })
    }
  }
}
