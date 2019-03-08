import { validateSlug } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('slug validation', () => {
  it('validates slug', () => {
    const slugs = [
      'abc', // three letters
      'foo-bar'
    ]

    slugs.forEach(slug => {
      expect(validateSlug(slug)).toBe(slug)
    })
  })

  it('errors with invalid slug', () => {
    const slugs = ['', 'a', 'ab', ' foo', 'bar ', '-xoo', 'lus-']

    slugs.forEach(slug => {
      expect(validateSlug(slug)).toEqual(new ValidationError())
    })
  })
})
