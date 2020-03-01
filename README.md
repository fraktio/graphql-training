# Training Server

## Installation

Install Docker and start database services:

- `docker-compose up`

Install dependencies and start the service:

- `cp .env.example .env`
- `yarn && yarn knex migrate:latest && yarn start`
- Open http://localhost:8090

## GraphQL Playground

http://localhost:8090/graphql

## Migrations

Migrations are created using [Knex](https://knexjs.org/#Migrations).
Create a new migration with `yarn knex migrate:make <name>`.

## Tests

You need to apply migrations to the test database before running:

- `yarn knex-test migrate:latest`

To run tests:

- `yarn test`

## Accessing database (PostgreSQL)

- `docker-compose exec database psql -Ugraphql_training graphql_training`
- or `docker-compose exec test_database psql -Ugraphql_training graphql_training_test`
