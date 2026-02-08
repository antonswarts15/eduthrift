USE eduthrift;
-- Insert admin user if not exists
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, user_type, phone, school_name, created_at, updated_at)
VALUES (
           'antons@eduthrift.co.za',
           '$2a$10$slYQmyNdGzin7olVCI2/OPST9/PgBBkqquzi.Ss69qFUUgJ0uK9m6', -- bcrypt hash of "eduthrift123"
           'Antons',
           'Swarts',
           'ADMIN',
           '+27123456789',
           'Test School',
           NOW(),
           NOW()
       );