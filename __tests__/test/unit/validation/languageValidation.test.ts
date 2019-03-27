import { Language } from '@app/person/types'
import { validateLanguage } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('language validation', () => {
  it('validates language', () => {
    const languages = [Language.FI]

    languages.forEach(language => {
      expect(validateLanguage(language)).toEqual({
        success: true,
        value: language
      })
    })
  })

  it('errors with invalid language', () => {
    const languages = ['', ' fi', ' FI']

    languages.forEach(language => {
      expect(validateLanguage(language)).toEqual({
        error: new ValidationError('Language', language),
        success: false
      })
    })
  })
})
