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

    // Generate UUIDs
    const userIdResult = await client.query('SELECT gen_random_uuid() as id');
    const userId = userIdResult.rows[0].id;
    
    const authIdResult = await client.query('SELECT gen_random_uuid() as id');
    const authId = authIdResult.rows[0].id;
    
    const providerIdResult = await client.query('SELECT gen_random_uuid() as id');
    const providerId = providerIdResult.rows[0].id;

    // Hash password using PostgreSQL's crypt
    const hashResult = await client.query(
      "SELECT crypt($1, gen_salt('bf', 10)) as hash",
      [password]
    );
    const passwordHash = hashResult.rows[0].hash;

    // 1. Insert user
    await client.query(
      `INSERT INTO "user" (id, email, first_name, last_name, created_at, updated_at)
       VALUES ($1, $2, 'Admin', 'User', NOW(), NOW())`,
      [userId, email]
    );
    console.log('[Admin Check] User record created');

    // 2. Insert auth_identity (links user_id)
    await client.query(
      `INSERT INTO auth_identity (id, app_metadata, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())`,
      [authId, JSON.stringify({ user_id: userId })]
    );
    console.log('[Admin Check] Auth identity created');

    // 3. Insert provider_identity (contains password)
    await client.query(
      `INSERT INTO provider_identity (id, entity_id, provider, auth_identity_id, user_metadata, provider_metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        providerId,
        email,
        'emailpass',
        authId,
        null,
        JSON.stringify({ password: passwordHash })
      ]
    );
    console.log('[Admin Check] Provider identity created with password');

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

