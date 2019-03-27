import KSUID from 'ksuid'

import { CountryCode, Email, Municipality, Phone, PostalCode } from '@app/address/types'
import { BusinessID, Slug } from '@app/common/types'
import { BIC, IBAN, Money } from '@app/finance/types'
import {
  ScalarBIC,
  ScalarBusinessID,
  ScalarCountryCode,
  ScalarEmail,
  ScalarIBAN,
  ScalarKsuid,
  ScalarLanguage,
  ScalarMoney,
  ScalarMunicipality,
  ScalarPersonalIdentityCode,
  ScalarPhone,
  ScalarPostalCode,
  ScalarSlug,
  ScalarType,
  ScalarUILanguage
} from '@app/graphql/resolvers/types'
import { Language, PersonalIdentityCode } from '@app/person/types'
import { UILanguage } from '@app/user/types'

export function toScalarKsuid(ksuid: KSUID): ScalarKsuid {
  return {
    type: ScalarType.KSUID,
    value: ksuid.string
  }
}

export function toScalarSlug(slug: Slug): ScalarSlug {
  return {
    type: ScalarType.SLUG,
    value: slug.toString()
  }
}

export function toScalarMoney(money: Money): ScalarMoney {
  return {
    type: ScalarType.MONEY,
    value: money.getAmount()
  }
}

export function toScalarBusinessId(businessId: BusinessID): ScalarBusinessID {
  return {
    type: ScalarType.BUSINESS_ID,
    value: businessId.toString()
  }
}

export function toScalarPersonalIdentityCode(
  personalIdentityCode: PersonalIdentityCode
): ScalarPersonalIdentityCode {
  return {
    type: ScalarType.PERSONAL_IDENTITY_CODE,
    value: personalIdentityCode.toString()
  }
}

export function toScalarLanguage(language: Language): ScalarLanguage {
  return {
    type: ScalarType.LANGUAGE,
    value: language.toString()
  }
}

export function toScalarPostalCode(postalCode: PostalCode): ScalarPostalCode {
  return {
    type: ScalarType.POSTAL_CODE,
    value: postalCode.toString()
  }
}

export function toScalarPhone(phone: Phone): ScalarPhone {
  return {
    type: ScalarType.PHONE,
    value: phone.toString()
  }
}

export function toScalarEmail(email: Email): ScalarEmail {
  return {
    type: ScalarType.EMAIL,
    value: email.toString()
  }
}

export function toScalarMunicipality(municipality: Municipality): ScalarMunicipality {
  return {
    type: ScalarType.MUNICIPALITY,
    value: municipality.toString()
  }
}

export function toScalarCountryCode(countryCode: CountryCode): ScalarCountryCode {
  return {
    type: ScalarType.COUNTRY_CODE,
    value: countryCode.toString()
  }
}

export function toScalarIban(iban: IBAN): ScalarIBAN {
  return {
    type: ScalarType.IBAN,
    value: iban.toString()
  }
}

export function toScalarBic(bic: BIC): ScalarBIC {
  return {
    type: ScalarType.BIC,
    value: bic.toString()
  }
}

export function toScalarUiLanguage(uiLanguage: UILanguage): ScalarUILanguage {
  return {
    type: ScalarType.UI_LANGUAGE,
    value: uiLanguage.toString()
  }
}
