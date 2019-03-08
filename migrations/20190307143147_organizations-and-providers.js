exports.up = function(knex, Promise) {
  return knex.schema.raw(`
    CREATE TYPE country AS ENUM (
      'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX',
      'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ',
      'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK',
      'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM',
      'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
      'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS',
      'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN',
      'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN',
      'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV',
      'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ',
      'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI',
      'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM',
      'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC',
      'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV',
      'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR',
      'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
      'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
    );

    ALTER TABLE address
    ALTER COLUMN country TYPE country USING country::country;

    UPDATE address SET country = 'FI' WHERE country IS NULL;

    ALTER TABLE address
    ALTER COLUMN country SET NOT NULL;

    CREATE TABLE organization (
      id SERIAL PRIMARY KEY,
      address_id INT REFERENCES address (id) NOT NULL,
      ksuid CHAR(27) NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      business_id TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TRIGGER organization_modified_at_time
    BEFORE UPDATE ON organization FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();

    CREATE TABLE provider (
      id SERIAL PRIMARY KEY,
      ksuid CHAR(27) NOT NULL UNIQUE,
      organization_id INT REFERENCES organization (id) NOT NULL,
      address_id INT REFERENCES address (id) NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      business_id TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE,
      UNIQUE (organization_id, slug)
    );

    CREATE TRIGGER provider_modified_at_time
    BEFORE UPDATE ON provider FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();

    CREATE TABLE customer (
      id SERIAL PRIMARY KEY,
      ksuid CHAR(27) NOT NULL UNIQUE,
      business_id TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TRIGGER customer_modified_at_time
    BEFORE UPDATE ON customer FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();

    CREATE TABLE location (
      id SERIAL PRIMARY KEY,
      ksuid CHAR(27) NOT NULL UNIQUE,
      customer_id INT REFERENCES customer (id) NOT NULL,
      parent_id INT REFERENCES location (id),
      address_id INT REFERENCES address (id) NOT NULL,
      billing_address_id INT REFERENCES address (id),
      name TEXT NOT NULL,
      billing_id TEXT,
      default_billing_reference TEXT,
      billing_online_bill_operator TEXT,
      billing_online_bill_address TEXT,
      copy_billing_information BOOLEAN,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TRIGGER location_modified_at_time
    BEFORE UPDATE ON location FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();

    CREATE TABLE contact (
      id SERIAL PRIMARY KEY,
      ksuid CHAR(27) NOT NULL UNIQUE,
      location_id INT REFERENCES location (id) NOT NULL,
      label TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TRIGGER contact_modified_at_time
    BEFORE UPDATE ON contact FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();

    CREATE TABLE contract (
      id SERIAL PRIMARY KEY,
      ksuid CHAR(27) NOT NULL UNIQUE,
      provider_id INT REFERENCES provider (id) NOT NULL,
      customer_id INT REFERENCES customer (id) NOT NULL,
      start_date DATE,
      end_date DATE,
      payment_net_days INT,
      pricing_amount NUMERIC,
      pricing_amount_high NUMERIC,
      pricing_amount_low NUMERIC,
      price_holiday NUMERIC,
      price_eve NUMERIC,
      price_workday NUMERIC,
      price_saturday NUMERIC,
      price_sunday NUMERIC,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TRIGGER contract_modified_at_time
    BEFORE UPDATE ON contract FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();

    CREATE TABLE collective_agreement (
      id SERIAL PRIMARY KEY,
      ksuid CHAR(27) NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TRIGGER collective_agreement_modified_at_time
    BEFORE UPDATE ON collective_agreement FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();

    CREATE TYPE employment_type AS ENUM (
      'GENERAL_TERMS',
      'INDEFINITE_FULL_TIME',
      'INDEFINITE_PART_TIME',
      'FIXED_TERM_FULL_TIME',
      'FIXED_TERM_PART_TIME'
    );

    CREATE TABLE employment (
      id SERIAL PRIMARY KEY,
      ksuid CHAR(27) NOT NULL UNIQUE,
      person_id INT REFERENCES person (id) NOT NULL,
      provider_id INT REFERENCES provider (id) NOT NULL,
      collective_agreement_id INT REFERENCES collective_agreement (id) NOT NULL,
      type employment_type NOT NULL,
      start_date DATE,
      end_date DATE,
      average_hours INT,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TRIGGER employment_modified_at_time
    BEFORE UPDATE ON employment FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();
  `)
}

exports.down = function(knex, Promise) {
  return knex.schema.raw(`
    DROP TABLE employment;

    DROP TYPE employment_type;

    DROP TABLE collective_agreement;

    DROP TABLE contract;

    DROP TABLE contact;

    DROP TABLE location;

    DROP TABLE customer;

    DROP TABLE provider;

    DROP TABLE organization;

    ALTER TABLE address
    ALTER COLUMN country TYPE TEXT,
    ALTER COLUMN country DROP NOT NULL;

    DROP TYPE country;
  `)
}
