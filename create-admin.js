const { Client } = require('pg');
const crypto = require('crypto');

// Simple bcrypt-like hash for demonstration
// Railway should have bcrypt in the production environment
async function hashPassword(password) {
  // This is a workaround - ideally use bcrypt
  const bcrypt = require('bcrypt');
  return bcrypt.hashSync(password, 10);
}

async function createAdminUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const email = 'vghmzg@proton.me';
    const password = 'bwof4pqitzcjf3tie25uurvdeyvhj8qd';
    const userId = crypto.randomUUID();
    const authId = crypto.randomUUID();

    // Enable pgcrypto extension
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    console.log('pgcrypto extension enabled');

    // Check if user exists
    const existingUser = await client.query(
      'SELECT id FROM "user" WHERE email = $1',
      [email]
    );

    let finalUserId = userId;
    
    if (existingUser.rows.length > 0) {
      console.log('User already exists, updating...');
      finalUserId = existingUser.rows[0].id;
    } else {
      // Insert user
      const userResult = await client.query(
        `INSERT INTO "user" (id, email, first_name, last_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id`,
        [userId, email, 'Admin', 'User']
      );
      finalUserId = userResult.rows[0].id;
      console.log('User created:', finalUserId);
    }

    // Create password hash using PostgreSQL's crypt
    const hashResult = await client.query(
      "SELECT crypt($1, gen_salt('bf', 10)) as hash",
      [password]
    );
    const passwordHash = hashResult.rows[0].hash;

    // Insert or update auth identity
    await client.query(
      `INSERT INTO auth_identity (id, provider_id, provider, entity_id, user_metadata, auth_provider_metadata, app_metadata, provider_metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (provider_id, provider) DO UPDATE 
       SET auth_provider_metadata = $6,
           updated_at = NOW()`,
      [
        authId,
        email,
        'emailpass',
        finalUserId,
        JSON.stringify({}),
        JSON.stringify({ password: passwordHash }),
        JSON.stringify({}),
        JSON.stringify({})
      ]
    );

    console.log('✅ Admin user created/updated successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('You can now login at your admin dashboard');

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createAdminUser();

