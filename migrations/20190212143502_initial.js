exports.up = function(knex, Promise) {
  return knex.schema.raw(`
    CREATE TABLE person (id SERIAL PRIMARY KEY)
  `)
}

exports.down = function(knex, Promise) {
  return knex.schema.raw(`
    DROP TABLE person
  `)
}
