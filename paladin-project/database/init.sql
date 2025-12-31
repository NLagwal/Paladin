-- Create Paladin database and role
CREATE DATABASE paladin;

CREATE USER paladin_user WITH ENCRYPTED PASSWORD 'paladin';

GRANT ALL PRIVILEGES ON DATABASE paladin TO paladin_user;
