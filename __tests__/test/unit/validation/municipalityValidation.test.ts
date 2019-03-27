import { validateMunicipality } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('municipality validation', () => {
  it('validates municipality', () => {
    const municipalities = ['Helsinki', 'Vantaa']

    municipalities.forEach(municipality => {
      expect(validateMunicipality(municipality)).toEqual({
        success: true,
        value: municipality
      })
    })
  })

  it('errors with invalid municipality', () => {
    const municipalities = ['', 'helsinki', ' Helsinki']

    municipalities.forEach(municipality => {
      expect(validateMunicipality(municipality)).toEqual({
        error: new ValidationError('Municipality', municipality),
        success: false
      })
    })
  })
})
