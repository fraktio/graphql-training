import { Failure, Success, Try } from './types'

export function trySuccess<T, E extends Error>(result: Try<T, E>): T {
  if (result.success) {
    return result.value
  }

  throw result.error
}

export function toSuccess<T>(value: T): Success<T> {
  return {
    success: true,
    value
  }
}

export function toFailure<E>(error: E): Failure<E> {
  return {
    error,
    success: false
  }
}
