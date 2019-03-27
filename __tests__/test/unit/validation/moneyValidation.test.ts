import { Money } from '@app/finance/types'
import { validateMoney } from '@app/validation'
import { ValidationError } from '@app/validation/types'

describe('money validation', () => {
  it('validates money', done => {
    const amounts = [500, 0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]

    amounts.forEach(amount => {
      const result = validateMoney(amount)

      if (result.success) {
        expect(Money({ amount, currency: 'EUR', precision: 2 }).equalsTo(result.value)).toBe(true)

        done()
      } else {
        done.fail('Expected an instance of Money')
      }
    })
  })

  it('errors with invalid money', done => {
    const amounts = [NaN, Infinity, -Infinity]

    amounts.forEach(amount => {
      const result = validateMoney(amount)

      if (!result.success) {
        expect(result.error).toEqual(new ValidationError('Money', amount))

        done()
      } else {
        done.fail('Expected a ValidationError')
      }
    })
  })
})
