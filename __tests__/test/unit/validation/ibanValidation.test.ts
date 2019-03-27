import { validateIban } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('iban validation', () => {
  it('validates iban', () => {
    const ibans = ['FI6842333892000469']

    ibans.forEach(iban => {
      expect(validateIban(iban)).toEqual({
        success: true,
        value: iban
      })
    })
  })

  it('errors with invalid iban', () => {
    const ibans = ['', 'foo', 'fi6842333892000469', ' FI6842333892000469']

    ibans.forEach(iban => {
      expect(validateIban(iban)).toEqual({
        error: new ValidationError('IBAN', iban),
        success: false
      })
    })
  })
})
