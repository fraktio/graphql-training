import { validatePostalCode } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('postal code validation', () => {
  it('validates postal code', () => {
    const postalCodes = ['00100', '01700']

    postalCodes.forEach(postalCode => {
      expect(validatePostalCode(postalCode)).toEqual({
        success: true,
        value: postalCode
      })
    })
  })

  it('errors with invalid postal code', () => {
    const postalCodes = ['', 'foo', ' 00100', '0010', '001000']

    postalCodes.forEach(postalCode => {
      expect(validatePostalCode(postalCode)).toEqual({
        error: new ValidationError('PostalCode', postalCode),
        success: false
      })
    })
  })
})
