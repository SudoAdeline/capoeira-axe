import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, saveDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function sanitizeUser(row) {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email,
    isPremium: !!row.is_premium,
    firstLogin: row.first_login,
  };
}

router.post('/register', async (req, res) => {
  try {
    const db = await getDb();
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const normalized = email.toLowerCase().trim();
    const existing = db.exec('SELECT id FROM users WHERE email = ?', [normalized]);
    if (existing.length && existing[0].values.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name.trim(), normalized, hash]);
    saveDb();

    const rows = db.exec('SELECT * FROM users WHERE email = ?', [normalized]);
    const cols = rows[0].columns;
    const vals = rows[0].values[0];
    const user = Object.fromEntries(cols.map((c, i) => [c, vals[i]]));

    // Create empty user_data row
    db.run('INSERT INTO user_data (user_id) VALUES (?)', [user.id]);
    saveDb();

    res.json({ token: signToken(user.id, user.email), user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const db = await getDb();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const normalized = email.toLowerCase().trim();
    const rows = db.exec('SELECT * FROM users WHERE email = ?', [normalized]);
    if (!rows.length || !rows[0].values.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const cols = rows[0].columns;
    const vals = rows[0].values[0];
    const user = Object.fromEntries(cols.map((c, i) => [c, vals[i]]));

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ token: signToken(user.id, user.email), user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const rows = db.exec('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (!rows.length || !rows[0].values.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cols = rows[0].columns;
    const vals = rows[0].values[0];
    const user = Object.fromEntries(cols.map((c, i) => [c, vals[i]]));

    res.json(sanitizeUser(user));
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
