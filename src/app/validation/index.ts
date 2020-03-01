import {
  CountryCode,
  Email,
  ID,
  Language,
  PersonalIdentityCode,
  Phone,
  Slug,
  Try
} from '@app/common/types'
import { toFailure, toSuccess, trySuccess } from '@app/common'

import { FinnishSSN } from 'finnish-ssn'
import { Hour } from '@app/date/types'
import { ValidationError } from './types'
import emailValidator from 'email-validator'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function asId(value: number): ID {
  return (value as unknown) as ID
}

export function validateHour(value: number): Try<Hour, ValidationError> {
  if (value >= 0 && value < 300 && Number.isInteger(value)) {
    return toSuccess((value as unknown) as Hour)
  }

  return toFailure(new ValidationError('Hour', value))
}

export function asHour(value: number): Hour {
  return trySuccess(validateHour(value))
}

export function validateSlug(value: string): Try<Slug, ValidationError> {
  if (/^[a-z][a-z\-]+[a-z]$/.test(value)) {
    return toSuccess((value as unknown) as Slug)
  }

  return toFailure(new ValidationError('Slug', value))
}

export function asSlug(value: string): Slug {
  return trySuccess(validateSlug(value))
}

export function validateEmail(value: string): Try<Email, ValidationError> {
  if (emailValidator.validate(value)) {
    return toSuccess((value as unknown) as Email)
  }

  return toFailure(new ValidationError('Email', value))
}

export function asEmail(value: string): Email {
  return trySuccess(validateEmail(value))
}

export function validatePhone(value: string): Try<Phone, ValidationError> {
  const parsed = parsePhoneNumberFromString(value, 'FI')

  if (parsed && parsed.isValid() && parsed.number === value) {
    return toSuccess((value as unknown) as Phone)
  }

  return toFailure(new ValidationError('Phone', value))
}

export function asPhone(value: string): Phone {
  return trySuccess(validatePhone(value))
}

export function validatePersonalIdentityCode(
  value: string
): Try<PersonalIdentityCode, ValidationError> {
  if (FinnishSSN.validate(value)) {
    return toSuccess((value as unknown) as PersonalIdentityCode)
  }

  return toFailure(new ValidationError('PersonalIdentityCode', value))
}

export function asPersonalIdentityCode(value: string): PersonalIdentityCode {
  return trySuccess(validatePersonalIdentityCode(value))
}

export function validateLanguage(value: string): Try<Language, ValidationError> {
  if (Object.keys(Language).includes(value)) {
    return toSuccess((value as unknown) as Language)
  }

  return toFailure(new ValidationError('Language', value))
}

export function asLanguage(value: string): Language {
  return trySuccess(validateLanguage(value))
}

export function validateCountryCode(value: string): Try<CountryCode, ValidationError> {
  if (Object.keys(CountryCode).includes(value)) {
    return toSuccess((value as unknown) as CountryCode)
  }

  return toFailure(new ValidationError('CountryCode', value))
}

export function asCountryCode(value: string): CountryCode {
  return trySuccess(validateCountryCode(value))
}
