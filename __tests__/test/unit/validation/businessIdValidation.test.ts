import { validateBusinessID } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('business id validation', () => {
  it('validates business id', () => {
    const businessIds = ['2617416-4', '0033438-5']

    businessIds.forEach(businessId => {
      expect(validateBusinessID(businessId)).toBe(businessId)
    })
  })

  it('errors with invalid business id', () => {
    const businessIds = ['', 'foo', ' 2617416-4', '2617416-4 ', '2617416-3']

    businessIds.forEach(businessId => {
      expect(validateBusinessID(businessId)).toEqual(new ValidationError())
    })
  })
})
