import { UILanguage } from '@app/user/types'
import { validateUiLanguage } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('ui language validation', () => {
  it('validates ui language', () => {
    const uiLanguages = [UILanguage.FI]

    uiLanguages.forEach(uiLanguage => {
      expect(validateUiLanguage(uiLanguage)).toEqual({
        success: true,
        value: uiLanguage
      })
    })
  })

  it('errors with invalid ui language', () => {
    const uiLanguages = ['', ' fi', ' FI']

    uiLanguages.forEach(uiLanguage => {
      expect(validateUiLanguage(uiLanguage)).toEqual({
        error: new ValidationError('UILanguage', uiLanguage),
        success: false
      })
    })
  })
})
