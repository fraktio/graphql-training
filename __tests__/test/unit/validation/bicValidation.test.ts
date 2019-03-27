import { validateBic } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('bic validation', () => {
  it('validates bic', () => {
    const bics = ['NDEAFIHH']

    bics.forEach(bic => {
      expect(validateBic(bic)).toEqual({
        success: true,
        value: bic
      })
    })
  })

  it('errors with invalid bic', () => {
    const bics = ['', 'foo', 'ndeafihh', ' NDEAFIHH']

    bics.forEach(bic => {
      expect(validateBic(bic)).toEqual({
        error: new ValidationError('BIC', bic),
        success: false
      })
    })
  })
})
