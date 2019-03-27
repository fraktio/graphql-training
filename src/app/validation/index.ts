import emailValidator from 'email-validator'
import { FinnishBusinessIds } from 'finnish-business-ids'
import ssn from 'finnish-ssn'
import { isValidBIC, isValidIBAN } from 'ibantools'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

import { municipalities } from '@app/address/municipalities'
import { CountryCode, Email, Municipality, Phone, PostalCode } from '@app/address/types'
import { toFailure, toSuccess, trySuccess } from '@app/common'
import { BusinessID, ID, Slug, Try } from '@app/common/types'
import { Hour } from '@app/date/types'
import { BIC, IBAN, Money } from '@app/finance/types'
import { Language, PersonalIdentityCode } from '@app/person/types'
import { UILanguage } from '@app/user/types'
import { ValidationError } from './types'

export function asId(value: number): ID {
  return (value as unknown) as ID
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
  if (ssn.validate(value)) {
    return toSuccess((value as unknown) as PersonalIdentityCode)
  }

  return toFailure(new ValidationError('PersonalIdentityCode', value))
}

export function asPersonalIdentityCode(value: string): PersonalIdentityCode {
  return trySuccess(validatePersonalIdentityCode(value))
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

export function validateLanguage(value: string): Try<Language, ValidationError> {
  if (Object.keys(Language).includes(value)) {
    return toSuccess((value as unknown) as Language)
  }

  return toFailure(new ValidationError('Language', value))
}

export function asLanguage(value: string): Language {
  return trySuccess(validateLanguage(value))
}

export function validateMunicipality(value: string): Try<Municipality, ValidationError> {
  if (municipalities.includes(value)) {
    return toSuccess((value as unknown) as Municipality)
  }

  return toFailure(new ValidationError('Municipality', value))
}

export function asMunicipality(value: string): Municipality {
  return trySuccess(validateMunicipality(value))
}

export function validatePostalCode(value: string): Try<PostalCode, ValidationError> {
  if (/^\d{5}$/.test(value)) {
    return toSuccess((value as unknown) as PostalCode)
  }

  return toFailure(new ValidationError('PostalCode', value))
}

export function asPostalCode(value: string): PostalCode {
  return trySuccess(validatePostalCode(value))
}

export function validateIban(value: string): Try<IBAN, ValidationError> {
  if (isValidIBAN(value)) {
    return toSuccess((value as unknown) as IBAN)
  }

  return toFailure(new ValidationError('IBAN', value))
}

export function asIban(value: string): IBAN {
  return trySuccess(validateIban(value))
}

export function validateBic(value: string): Try<BIC, ValidationError> {
  if (isValidBIC(value) && value.toUpperCase() === value) {
    return toSuccess((value as unknown) as BIC)
  }

  return toFailure(new ValidationError('BIC', value))
}

export function asBic(value: string): BIC {
  return trySuccess(validateBic(value))
}

export function validateMoney(value: number): Try<Money, ValidationError> {
  try {
    return toSuccess(Money({ amount: value, currency: 'EUR' }))
  } catch (e) {
    return toFailure(new ValidationError('Money', value))
  }
}

export function asMoney(value: number): Money {
  return trySuccess(validateMoney(value))
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

export function validateBusinessId(value: string): Try<BusinessID, ValidationError> {
  if (FinnishBusinessIds.isValidBusinessId(value)) {
    return toSuccess((value as unknown) as BusinessID)
  }

  return toFailure(new ValidationError('BusinessID', value))
}

export function asBusinessId(value: string): BusinessID {
  return trySuccess(validateBusinessId(value))
}

export function validateUiLanguage(value: string): Try<UILanguage, ValidationError> {
  if (Object.keys(UILanguage).includes(value)) {
    return toSuccess((value as unknown) as UILanguage)
  }

  return toFailure(new ValidationError('UILanguage', value))
}

export function asUiLanguage(value: string): UILanguage {
  return trySuccess(validateUiLanguage(value))
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
