exports.up = function(knex, Promise) {
  return knex.schema.raw(`
    CREATE OR REPLACE FUNCTION update_modified_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.modified_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    ALTER TABLE address
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

    ALTER TABLE education
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

    ALTER TABLE license
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

    ALTER TABLE person
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

    ALTER TABLE user_account
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

    ALTER TABLE work_permit
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

    CREATE TRIGGER address_modified_at_time BEFORE UPDATE ON address FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();
    CREATE TRIGGER education_modified_at_time BEFORE UPDATE ON education FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();
    CREATE TRIGGER license_modified_at_time BEFORE UPDATE ON license FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();
    CREATE TRIGGER person_modified_at_time BEFORE UPDATE ON person FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();
    CREATE TRIGGER user_account_modified_at_time BEFORE UPDATE ON user_account FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();
    CREATE TRIGGER work_permit_modified_at_time BEFORE UPDATE ON work_permit FOR EACH ROW EXECUTE PROCEDURE update_modified_at_column();
  `)
}

exports.down = function(knex, Promise) {
  return knex.schema.raw(`
    ALTER TABLE address
    DROP COLUMN created_at,
    DROP COLUMN modified_at;

    ALTER TABLE education
    DROP COLUMN created_at,
    DROP COLUMN modified_at;

    ALTER TABLE license
    DROP COLUMN created_at,
    DROP COLUMN modified_at;

    ALTER TABLE person
    DROP COLUMN created_at,
    DROP COLUMN modified_at;

    ALTER TABLE user_account
    DROP COLUMN created_at,
    DROP COLUMN modified_at;

    ALTER TABLE work_permit
    DROP COLUMN created_at,
    DROP COLUMN modified_at;

    DROP TRIGGER address_modified_at_time ON address;
    DROP TRIGGER education_modified_at_time ON education;
    DROP TRIGGER license_modified_at_time ON license;
    DROP TRIGGER person_modified_at_time ON person;
    DROP TRIGGER user_account_modified_at_time ON user_account;
    DROP TRIGGER work_permit_modified_at_time ON work_permit;

    DROP FUNCTION update_modified_at_column();
  `)
}
