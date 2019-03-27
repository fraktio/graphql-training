import { validatePhone } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('phone validation', () => {
  it('validates phone', () => {
    const phones = ['+35840123456']

    phones.forEach(phone => {
      expect(validatePhone(phone)).toEqual({
        success: true,
        value: phone
      })
    })
  })

  it('errors with invalid phone', () => {
    const phones = ['', 'foo', '040123456', '+3584012', '+358 40123456']

    phones.forEach(phone => {
      expect(validatePhone(phone)).toEqual({
        error: new ValidationError('Phone', phone),
        success: false
      })
    })
  })
})
