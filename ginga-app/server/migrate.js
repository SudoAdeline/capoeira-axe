import { getDb, saveDb } from './db.js';

export async function runMigrations() {
  const db = await getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_premium INTEGER DEFAULT 0,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      first_login TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER PRIMARY KEY REFERENCES users(id),
      completed TEXT DEFAULT '{}',
      custom_skills TEXT DEFAULT '{}',
      cords TEXT DEFAULT '[]',
      songs TEXT DEFAULT '[]',
      events TEXT DEFAULT '[]',
      attending TEXT DEFAULT '{}',
      preferences TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Add name column to existing databases
  try {
    db.run('ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT ""');
  } catch { /* column already exists */ }

  saveDb();
}
