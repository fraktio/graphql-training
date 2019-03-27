import { validateCountryCode } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('country code validation', () => {
  it('validates country code', () => {
    const countryCodes = ['FI', 'SE', 'US', 'GI', 'KZ', 'ZW']

    countryCodes.forEach(countryCode => {
      expect(validateCountryCode(countryCode)).toEqual({
        success: true,
        value: countryCode
      })
    })
  })

  it('errors with invalid country code', () => {
    const countryCodes = ['', 'fi', ' FI', 'FIN']

    countryCodes.forEach(countryCode => {
      expect(validateCountryCode(countryCode)).toEqual({
        error: new ValidationError('CountryCode', countryCode),
        success: false
      })
    })
  })
})
