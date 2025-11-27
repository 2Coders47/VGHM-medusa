const bcrypt = require('bcrypt');
const crypto = require('crypto');

const email = process.env.MEDUSA_ADMIN_EMAIL || 'vghmzg@proton.me';
const password = process.env.MEDUSA_ADMIN_PASSWORD || 'bwof4pqitzcjf3tie25uurvdeyvhj8qd';

const passwordHash = bcrypt.hashSync(password, 10);
const userId = crypto.randomUUID();
const authId = crypto.randomUUID();

console.log(`
-- SQL to create admin user
-- Copy and paste this into Railway PostgreSQL console

BEGIN;

-- Insert user
INSERT INTO "user" (id, email, first_name, last_name, created_at, updated_at)
VALUES ('${userId}', '${email}', 'Admin', 'User', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert auth identity
INSERT INTO auth_identity (id, provider_id, provider, entity_id, user_metadata, auth_provider_metadata, app_metadata, provider_metadata, created_at, updated_at)
VALUES ('${authId}', '${email}', 'emailpass', '${userId}', '{}', '{"password": "${passwordHash}"}', '{}', '{}', NOW(), NOW())
ON CONFLICT (provider_id, provider) DO UPDATE 
SET auth_provider_metadata = '{"password": "${passwordHash}"}',
    updated_at = NOW();

COMMIT;

-- Verify the user was created
SELECT id, email, first_name, last_name FROM "user" WHERE email = '${email}';
`);

