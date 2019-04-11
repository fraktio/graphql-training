exports.up = function(knex, Promise) {
  return knex.schema.raw(`
    ALTER TABLE customer RENAME TO client;

    ALTER TABLE location
    RENAME COLUMN customer_id TO client_id;

    ALTER TABLE contract
    RENAME COLUMN customer_id TO client_id;
  `)
}

exports.down = function(knex, Promise) {
  return knex.schema.raw(`
    ALTER TABLE client RENAME TO customer;

    ALTER TABLE location
    RENAME COLUMN client_id TO customer_id;

    ALTER TABLE contract
    RENAME COLUMN client_id TO customer_id;
  `)
}
