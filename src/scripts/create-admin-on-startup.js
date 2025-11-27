const { Client } = require('pg');

async function ensureAdminUserExists() {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Admin Check] Skipping admin user check in non-production environment');
    return;
  }

  const email = process.env.MEDUSA_ADMIN_EMAIL;
  const password = process.env.MEDUSA_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('[Admin Check] MEDUSA_ADMIN_EMAIL or MEDUSA_ADMIN_PASSWORD not set, skipping admin user creation');
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('[Admin Check] Connected to database');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM "user" WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('[Admin Check] Admin user already exists, skipping creation');
      await client.end();
      return;
    }

    console.log('[Admin Check] No admin user found, creating...');

    // Enable pgcrypto extension
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    // Create admin user using PostgreSQL's crypt function
    await client.query(`
      DO $$
      DECLARE
        user_id uuid := gen_random_uuid();
        auth_id uuid := gen_random_uuid();
        user_email text := $1;
        user_password text := $2;
        password_hash text;
      BEGIN
        password_hash := crypt(user_password, gen_salt('bf', 10));
        
        INSERT INTO "user" (id, email, first_name, last_name, created_at, updated_at)
        VALUES (user_id, user_email, 'Admin', 'User', NOW(), NOW());
        
        INSERT INTO auth_identity (id, provider_id, provider, entity_id, user_metadata, auth_provider_metadata, app_metadata, provider_metadata, created_at, updated_at)
        VALUES (auth_id, user_email, 'emailpass', user_id, '{}', jsonb_build_object('password', password_hash), '{}', '{}', NOW(), NOW());
      END $$;
    `, [email, password]);

    console.log('✅ [Admin Check] Admin user created successfully!');
    console.log(`   Email: ${email}`);

  } catch (error) {
    console.error('❌ [Admin Check] Error ensuring admin user exists:', error.message);
  } finally {
    await client.end();
  }
}

// Run the check
ensureAdminUserExists().catch(console.error);

