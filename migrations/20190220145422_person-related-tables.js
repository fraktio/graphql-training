exports.up = function(knex, Promise) {
  return knex.schema.raw(`
    CREATE TYPE ui_language AS ENUM ('FI', 'EN');

    CREATE TYPE language AS ENUM ('FI', 'SE', 'EN');

    CREATE TABLE address (
      id SERIAL PRIMARY KEY,
      street_address TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      municipality TEXT NOT NULL,
      country TEXT
    );

    CREATE TABLE user_account (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    ALTER TABLE person
    ADD COLUMN user_account_id INT REFERENCES user_account (id) NOT NULL,
    ADD COLUMN address_id INT REFERENCES address (id) NOT NULL,
    ADD COLUMN first_name TEXT NOT NULL,
    ADD COLUMN last_name TEXT NOT NULL,
    ADD COLUMN nick_name TEXT,
    ADD COLUMN personal_identity_code TEXT NOT NULL UNIQUE,
    ADD COLUMN nationality TEXT NOT NULL,
    ADD COLUMN phone TEXT UNIQUE,
    ADD COLUMN iban TEXT,
    ADD COLUMN bic TEXT,
    ADD COLUMN bank_account_is_shared BOOLEAN NOT NULL,
    ADD COLUMN ui_language ui_language NOT NULL,
    ADD COLUMN languages language[] NOT NULL,
    ADD COLUMN limitations TEXT,
    ADD COLUMN preferred_working_areas text[] NOT NULL,
    ADD COLUMN desired_salary NUMERIC;

    CREATE TABLE work_permit (
      id SERIAL PRIMARY KEY,
      person_id INT REFERENCES person (id) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      description TEXT,
      is_unlimited BOOLEAN NOT NULL
    );

    CREATE TYPE license_type AS ENUM (
      'DRIVING_LICENSE',
      'HAS_CAR',
      'HYGIENE_PASSPORT',
      'ALCOHOL_PASSPORT'
    );

    CREATE TABLE license (
      id SERIAL PRIMARY KEY,
      person_id INT REFERENCES person (id) NOT NULL,
      type license_type NOT NULL,
      end_date DATE
    );

    CREATE TABLE education (
      id SERIAL PRIMARY KEY,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      school TEXT NOT NULL,
      degree TEXT NOT NULL,
      field_of_study TEXT NOT NULL
    );
  `)
}

exports.down = function(knex, Promise) {
  return knex.schema.raw(`
    DROP TABLE education;

    DROP TABLE license;

    DROP TYPE license_type;

    DROP TABLE work_permit;

    ALTER TABLE person
    DROP COLUMN user_account_id,
    DROP COLUMN address_id,
    DROP COLUMN first_name,
    DROP COLUMN last_name,
    DROP COLUMN nick_name,
    DROP COLUMN personal_identity_code,
    DROP COLUMN nationality,
    DROP COLUMN phone,
    DROP COLUMN iban,
    DROP COLUMN bic,
    DROP COLUMN bank_account_is_shared,
    DROP COLUMN ui_language,
    DROP COLUMN languages,
    DROP COLUMN limitations,
    DROP COLUMN preferred_working_areas,
    DROP COLUMN desired_salary;

    DROP TABLE address;

    DROP TABLE user_account;

    DROP TYPE language;

    DROP TYPE ui_language;
  `)
}
