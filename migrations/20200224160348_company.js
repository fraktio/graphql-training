exports.up = function(knex) {
  return knex.schema.raw(`

    CREATE TABLE company (
      id SERIAL PRIMARY KEY,
      ksuid CHAR(27) NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
    );

    CREATE TABLE employment (
      id SERIAL PRIMARY KEY,
      company_id INT REFERENCES company (id) NOT NULL,
      person_id INT REFERENCES person (id) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      UNIQUE (company_id, person_id)
    );
  `)
}

exports.down = function(knex) {
  return knex.schema.raw(`
    DROP TABLE company;
    DROP TABLE employment;
  `)
}
