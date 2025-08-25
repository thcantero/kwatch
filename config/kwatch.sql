\echo 'Delete and recreate kwatch db?'
\prompt 'Return for yes or control-C to cancel >' foo

DROP DATABASE kwatch;
CREATE DATABASE kwatch;
\connect kwatch

-- Run Schema & Seed
\i kwatch-schema.sql
\i kwatch-seed.sql

\echo 'Delete and recreate kwatch_test db?'
\prompt 'Return for yes or control-C to cancel >' foo

DROP DATABASE kwatch_test;
CREATE DATABASE kwatch_test;
\connect kwatch_test

-- Run Schema & Seed
\i kwatch-schema.sql