-- fromcheatsheet
CREATE TABLE IF NOT EXISTS
users(
  id SERIAL PRIMARY KEY NOT NULL,
  first_name VARCHAR(256) NOT NULL,
  last_name VARCHAR(256) NOT NULL,
  ssn INTEGER NOT NULL,
  ninja_status BOOLEAN NOT NULL,
  biography TEXT NOT NULL
);