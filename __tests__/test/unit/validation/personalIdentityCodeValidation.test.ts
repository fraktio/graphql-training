import { validatePersonalIdentityCode } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('personal identity code validation', () => {
  it('validates personal identity code', () => {
    const personalIdentityCodes = ['011197-283N']

    personalIdentityCodes.forEach(personalIdentityCode => {
      expect(validatePersonalIdentityCode(personalIdentityCode)).toEqual({
        success: true,
        value: personalIdentityCode
      })
    })
  })

  it('errors with invalid personal identity code', () => {
    const personalIdentityCodes = ['', 'foo', '011197-283n', '011197-283N ']

    personalIdentityCodes.forEach(personalIdentityCode => {
      expect(validatePersonalIdentityCode(personalIdentityCode)).toEqual({
        error: new ValidationError('PersonalIdentityCode', personalIdentityCode),
        success: false
      })
    })
  })
})
