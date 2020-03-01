exports.up = function(knex) {
  return knex.schema.raw(`

    CREATE TYPE access_rights AS ENUM ('PERSONAL', 'RECRUITING', 'SENSITIVE','ADMIN');

    CREATE TABLE user_account (
      id SERIAL PRIMARY KEY,
      ksuid CHAR(27) NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      roles access_rights[] NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
    );

    CREATE TABLE authentication_token (
      id SERIAL PRIMARY KEY,
      user_account_id INT REFERENCES user_account (id) NOT NULL,
      token TEXT NOT NULL,
      authenticated_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
    );

  `)
}

exports.down = function(knex) {
  return knex.schema.raw(`
    DROP TABLE authentication_token;
    DROP TABLE user_account;
    DROP TYPE access_rights;
  `)
}
