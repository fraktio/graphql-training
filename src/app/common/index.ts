import { Failure, Success } from './types'

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
