exports.up = function(knex, Promise) {
  return knex.schema.raw(`

    CREATE TYPE language AS ENUM ('FI', 'SE', 'EN');

    CREATE OR REPLACE FUNCTION update_modified_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.modified_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TABLE person (id SERIAL PRIMARY KEY);
    CREATE TABLE address (
      id SERIAL PRIMARY KEY,
      street_address TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      municipality TEXT NOT NULL,
      country TEXT
    );

    ALTER TABLE person
      ADD COLUMN ksuid CHAR(27) NOT NULL UNIQUE,
      ADD COLUMN first_name TEXT NOT NULL,
      ADD COLUMN last_name TEXT NOT NULL,
      ADD COLUMN personal_identity_code TEXT NOT NULL UNIQUE,
      ADD COLUMN nationality TEXT NOT NULL,
      ADD COLUMN phone TEXT UNIQUE,
      ADD COLUMN email TEXT UNIQUE,
      ADD COLUMN languages language[] NOT NULL,
      ADD COLUMN birthday TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  `)
}

exports.down = function(knex, Promise) {
  return knex.schema.raw(`
    DROP TABLE person;
    DROP TABLE address;
  `)
}
