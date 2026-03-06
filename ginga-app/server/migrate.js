import { query } from './db.js';

export async function runMigrations() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_premium BOOLEAN DEFAULT false,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      first_login TIMESTAMPTZ DEFAULT now(),
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER PRIMARY KEY REFERENCES users(id),
      completed TEXT DEFAULT '{}',
      custom_skills TEXT DEFAULT '{}',
      cords TEXT DEFAULT '[]',
      songs TEXT DEFAULT '[]',
      events TEXT DEFAULT '[]',
      attending TEXT DEFAULT '{}',
      preferences TEXT DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);
}
