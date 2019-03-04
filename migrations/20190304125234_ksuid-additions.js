exports.up = function(knex, Promise) {
  return knex.schema.raw(`
    ALTER TABLE person
    ADD COLUMN ksuid CHAR(27) NOT NULL UNIQUE;

    ALTER TABLE user_account
    ADD COLUMN ksuid CHAR(27) NOT NULL UNIQUE;
  `)
}

exports.down = function(knex, Promise) {
  return knex.schema.raw(`
    ALTER TABLE person
    DROP COLUMN ksuid;

    ALTER TABLE user_account
    DROP COLUMN ksuid;
  `)
}
