-- -- fromcheatsheet
-- CREATE TABLE IF NOT EXISTS
-- users(
--   id SERIAL PRIMARY KEY NOT NULL,
--   first_name VARCHAR(256) NOT NULL,
--   last_name VARCHAR(256) NOT NULL,
--   ssn INTEGER NOT NULL,
--   ninja_status BOOLEAN NOT NULL,
--   biography TEXT NOT NULL
-- );

DROP TABLE IF EXISTS locations;


CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
        
    location_name VARCHAR (255),
    formated_query VARCHAR (255),
    location_lon VARCHAR (255),
    location_lat VARCHAR (255),

);