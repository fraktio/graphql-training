import { validateEmail } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('email validation', () => {
  it('validates email', () => {
    const emails = ['foo@bar.com']

    emails.forEach(email => {
      expect(validateEmail(email)).toEqual({
        success: true,
        value: email
      })
    })
  })

  it('errors with invalid email', () => {
    const emails = ['', 'localhost', ' foo@bar.com', ' foo@']

    emails.forEach(email => {
      expect(validateEmail(email)).toEqual({
        error: new ValidationError('Email', email),
        success: false
      })
    })
  })
})
