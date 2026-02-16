-- Reset database (WARNING: This will delete ALL data)
-- Run this manually if you want a clean slate

-- Drop all tables
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ticket_activity_log CASCADE;
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS ticket_images CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;

-- Drop drizzle schema
DROP SCHEMA IF EXISTS drizzle CASCADE;
