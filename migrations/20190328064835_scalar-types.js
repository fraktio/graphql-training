exports.up = function(knex, Promise) {
  return knex.schema.raw(`
    ALTER TYPE country RENAME TO country_code;

    -- Sorry for changing your nationalities, but we need to make sure it's valid
    UPDATE person SET nationality = 'FI';

    ALTER TABLE person
    ALTER COLUMN nationality TYPE country_code USING nationality::country_code,
    ALTER COLUMN desired_salary TYPE INTEGER USING (desired_salary * 100)::int;
  `)
}

exports.down = function(knex, Promise) {
  return knex.schema.raw(`
    ALTER TYPE country_code RENAME TO country;

    ALTER TABLE person
    ALTER COLUMN nationality TYPE TEXT,
    ALTER COLUMN desired_salary TYPE NUMERIC USING desired_salary::numeric / 100;

    UPDATE person SET nationality = 'FIN';
  `)
}
