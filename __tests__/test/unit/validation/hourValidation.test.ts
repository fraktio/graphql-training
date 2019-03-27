import { validateHour } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('hour validation', () => {
  it('validates hour', () => {
    const hours = [0, 1, 299]

    hours.forEach(hour => {
      expect(validateHour(hour)).toEqual({
        success: true,
        value: hour
      })
    })
  })

  it('errors with hour', () => {
    const hours = [-1, 1.1, 300, NaN, Infinity]

    hours.forEach(hour => {
      expect(validateHour(hour)).toEqual({
        error: new ValidationError('Hour', hour),
        success: false
      })
    })
  })
})
